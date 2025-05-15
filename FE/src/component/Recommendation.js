import { useEffect, useState, useContext } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import Card from './Card';
import DayList from './DayList.js';
import PlaceBin from './PlaceBin.js';
import AuthAxios from './AuthAxios.js';

import { PlanContext } from '../context/PlanContext';

// OverlayCard 위치 판단 알고리즘
function collisionDetectionAlgorithm({ droppableContainers, ...args }) {
  const closestCenterCollisions = closestCenter({
    ...args,
    droppableContainers: droppableContainers,
  });

  // closestCenter로 OverlayCard가 PlaceBin과 가까운지 확인
  if (closestCenterCollisions[0].id === 'place-bin') {
    return closestCenterCollisions;
  }

  // closestCorners로 OverlayCard가 어느 Card와 가장 가까운지 확인
  return closestCorners({
    ...args,
    droppableContainers: droppableContainers,
  });
}

const Recommendation = ({ planId }) => {
  const { data, setData } = useContext(PlanContext);

  // dragging 중인 Card의 id
  const [activeId, setActiveId] = useState(null);

  const activeItem = activeId
    ? Object.values(data)
        .flat()
        .find((item) => item.local_id === activeId)
    : null;

  // DragOverly가 PlaceBin에 가까우면 true로 설정
  const [isBinActive, setIsBinActive] = useState(false);

  // Drag and drop에 MouseSensor와 TouchSensor 사용
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 400, tolerance: 0 },
    })
  );

  useEffect(() => {
    setData(data);
  }, [data, setData]);

  return (
    <div
      className="scroll-container"
      style={{
        width: '100%',
        height: '100%', // 원하는 높이로 조정
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionAlgorithm}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {data &&
          Object.keys(data)
            .sort()
            .map((day, index) => (
              <DayList key={day} id={day} day={index + 1} />
            ))}

        {activeId === null ? null : <PlaceBin isActive={isBinActive} />}

        <DragOverlay>
          {activeId ? <Card isOverlay={true} item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  // Card의 id를 받아 해당 Card가 속한 day를 반환
  function findDay(id) {
    if (id in data) {
      return id;
    }
    return Object.keys(data).find((day) =>
      data[day].some((place) => place.local_id === id)
    );
  }

  // Drag 시작
  function handleDragStart(event) {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  }

  // Drag 중
  function handleDragOver(event) {
    const { active, over, draggingRect } = event;

    if (!over) {
      return;
    }

    const { id } = active;
    const activeDay = findDay(id);
    const { id: overId } = over;

    // OverlayCard가 PlaceBin에 가까우면 isBinActive를 true로 설정하고 return
    if (overId === 'place-bin') {
      setIsBinActive(true);
      return;
    }
    setIsBinActive(false);

    const overDay = findDay(overId);

    if (!activeDay || !overDay || activeDay === overDay) {
      return;
    }

    setData((prevData) => {
      const activeItems = prevData[activeDay];
      const overItems = prevData[overDay];

      const activeIndex = activeItems.findIndex(
        (place) => place.local_id === id
      );
      const overIndex = overItems.findIndex(
        (place) => place.local_id === overId
      );

      const isBelowLastItem =
        draggingRect &&
        overIndex === overItems.length - 1 &&
        draggingRect.offsetTop > over.rect.offsetTop + over.rect.rect.height;

      const modifier = isBelowLastItem ? 1 : 0;

      const newIndex =
        overIndex >= 0 ? overIndex + modifier : overItems.length + 1;

      return {
        ...prevData,
        [activeDay]: [...activeItems.filter((place) => place.local_id !== id)],
        [overDay]: [
          ...overItems.slice(0, newIndex),
          data[activeDay][activeIndex],
          ...overItems.slice(newIndex, prevData[overDay].length),
        ],
      };
    });
  }

  // Drag 종료
  function handleDragEnd(event) {
    const { active, over } = event;
    const { id } = active;
    const { id: overId } = over;

    const postData = async (newData) => {
      try {
        const response = await AuthAxios.put(`/plan/${planId}`, {
          data: newData,
        });
        console.log('Data sent successfully:', response.status);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    };

    const activeDay = findDay(id);

    if (overId === 'place-bin') {
      setData((prevData) => {
        const newData = { ...prevData };
        const activeItems = newData[activeDay].filter(
          (place) => place.local_id !== id
        );
        newData[activeDay] = activeItems;
        if (planId) {
          postData(newData);
        }
        return newData;
      });
      setActiveId(null);
      return;
    }
    const overDay = findDay(overId);

    if (!activeDay || !overDay) {
      return;
    }

    const activeIndex = data[activeDay].findIndex(
      (place) => place.local_id === id
    );
    const overIndex = data[overDay].findIndex(
      (place) => place.local_id === overId
    );

    if (activeIndex !== overIndex) {
      setData((prevData) => {
        const newData = {
          ...prevData,
          [overDay]: arrayMove(data[overDay], activeIndex, overIndex),
        };
        if (planId) {
          postData(newData);
        }
        return newData;
      });
    }
    setIsBinActive(false);
    setActiveId(null);
  }
};

export default Recommendation;
