import React from 'react';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import './DayList.css';
import Modal from './Modal.js';
import AddLocation from './AddLocation.js';
import TransportDuration from './TransportDuration';
import SortableCard from './SortableCard.js';
import { PlanContext } from '../context/PlanContext';
import { SelectedDayContext } from '../context/SelectedDayContext';

const API_KEY = process.env.REACT_APP_TMAP_API_KEY;
const durationCache = new Map();

function DayList({ id, day }) {
  const { data } = useContext(PlanContext);
  const items = data[id];
  const { selectedDay, setSelectedDay } = useContext(SelectedDayContext);
  const colors = [
    '#8861FF',
    '#C9D405',
    '#FB6AA1',
    '#477DEF',
    '#38A7EC',
    '#FF762D',
    '#FF4646',
    '#9CB5FF',
    '#5AE1C2',
    '#1CBB39',
  ];
  const dayColor = colors[(day - 1) % colors.length];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [durations, setDurations] = useState([]);

  useEffect(() => {
    async function Duration() {
      const promises = [];

      for (let i = 0; i < items.length - 1; i++) {
        const from = items[i];
        const to = items[i + 1];
        const cacheKey = `${from.kakao_id}-${to.kakao_id}`;

        if (durationCache.has(cacheKey)) {
          promises.push(Promise.resolve(durationCache.get(cacheKey)));
          continue;
        }
        try {
          const response = await axios.post(
            'https://apis.openapi.sk.com/transit/routes',
            {
              startX: from.x,
              startY: from.y,
              endX: to.x,
              endY: to.y,
            },
            {
              headers: {
                appKey: API_KEY,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.status === 14) {
            promises.push(response.message);
          } else if (response.status === 31) {
            promises.push(response.message);
          }

          const itineraries = response.data?.metaData?.plan?.itineraries;
          let time;
          if (!itineraries || itineraries.length === 0) {
            time = '도보 이동';
          } else {
            time = itineraries[0].totalTime;
            time = Math.ceil(time / 60); // 분 단위로 변환
            // 총 소요 시간 (s)
          }

          durationCache.set(cacheKey, time); // 캐시 저장
          promises.push(time);
        } catch (error) {
          console.error(error);
          promises.push(error.message);
        }
      }
      const results = await Promise.all(promises);
      setDurations(results);
    }

    if (items.length > 1) {
      Duration();
    } else {
      setDurations([]);
    }
  }, [items]);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectDay = () => {
    // 이미 선택된 일차를 다시 클릭하면 선택 해제
    // 선택된 일차가 없거나 다른 일차를 클릭하면 선택
    if (day === selectedDay) {
      setSelectedDay(0);
    } else {
      setSelectedDay(day);
    }
  };

  const { setNodeRef } = useDroppable({ id });

  const notSelected = selectedDay > 0 && day !== selectedDay;

  return (
    <SortableContext
      id={id}
      items={items.map((item) => item.local_id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="DayList">
        <div className="DayHeader" style={{ opacity: notSelected ? 0.4 : 1 }}>
          <div
            className="dayNum"
            style={{ color: dayColor, cursor: 'pointer' }}
            onClick={() => handleSelectDay()}
          >
            {day}일차
          </div>
          <div className="addPlace" onClick={openModal}>
            <span className="addButton"> + </span>장소추가
          </div>
        </div>
        <div ref={setNodeRef} className="DayContent">
          {items.map((item, index) => (
            <React.Fragment key={item.local_id}>
              <SortableCard item={item} notSelected={notSelected} dayId={day} />
              {index < items.length - 1 && (
                <TransportDuration duration={durations[index]} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <Modal open={isModalOpen} close={closeModal}>
        <AddLocation dayId={day} close={closeModal} />
      </Modal>
    </SortableContext>
  );
}

export default DayList;
