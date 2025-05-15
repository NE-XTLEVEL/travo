import { useContext, useState } from 'react';
import './AddLocation.css';
import { LuSend } from 'react-icons/lu';
import { FaPlus } from 'react-icons/fa6';
import { PlanContext } from '../context/PlanContext';
import { BeatLoader } from 'react-spinners';
// import AuthAxios from './AuthAxios';
import authAxios from './AuthAxios';

const FixLocation = ({ item, close, dayId }) => {
  const [keyWord, setKeyWord] = useState('');
  const [places, setPlaces] = useState([]);
  const { data, setData } = useContext(PlanContext);
  const [isLoading, setIsLoading] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const planId = Number(queryParams.get('planId'));
  /* eslint-disable camelcase */
  const fixPlaces = (keyWord) => {
    setIsLoading(true);
    authAxios
      .post(
        'https://api.travo.kr/location/recommendation/one',
        {
          description: keyWord,
          day: 0,
          category: item.category,
          is_lunch: true,
          x: item.x,
          y: item.y,
          high_review: true,
          local_id: item.local_id,
          original_id: item.kakao_id,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setPlaces(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('fixlocation 실패', err);
        setIsLoading(false);
      });
  };
  const handleChange = (e) => {
    const el = e.target;
    setKeyWord(el.value);
    el.style.height = 'auto'; // 높이 초기화
    el.style.height = `${el.scrollHeight}px`; // 콘텐츠에 맞춰 자동 높이
  };
  /* eslint-enable camelcase */
  const handleFix = (place) => {
    console.log(dayId);
    const newData = {
      ...data,
      [`day${dayId}`]: data[`day${dayId}`].map((oldItem) =>
        oldItem.local_id === place.local_id ? place : oldItem
      ),
    };
    setData(newData);
    authAxios
      .put(`/plan/${planId}`, {
        data: newData,
      })
      .then((res) => {
        console.log(res.data.message);
      })
      .catch((err) => {
        console.error(err);
      });

    close();
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fixPlaces(keyWord);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. 제목 영역 (20%) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
        }}
      >
        <div style={{ fontSize: '130%' }}>
          {item.name}을 어떤 장소로 바꿀까요?
        </div>
      </div>

      {/* 2. 검색창 영역 (10%) */}
      <div
        style={{
          flex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '90%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            backgroundColor: '#EFEFEF',
            borderRadius: '10px',
          }}
        >
          <textarea
            className="searchbar"
            style={{
              fontSize: '100%',
              width: '80%',
              resize: 'none',
              overflowY: 'auto',
              maxHeight: '130px',
              minHeight: '40px',
              lineHeight: '1.5',
              outline: 'none',
            }}
            value={keyWord}
            onChange={(e) => handleChange(e)}
            onKeyDown={(e) => handleKeyDown(e)}
          />
          <LuSend
            onClick={() => fixPlaces(keyWord)}
            style={{ cursor: 'pointer', scale: '1.5' }}
          />
        </div>
      </div>

      {/* 3. 리스트 영역 (70%) */}
      <div
        className="scroll-container"
        style={{
          flex: 7,
          overflow: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {isLoading && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {' '}
            <BeatLoader color="#9c63e1" size={10} speedMultiplier={0.5} />
          </div>
        )}
        <ul
          style={{
            margin: '0px',
            paddingLeft: '0px',
            display: 'flex',
            maxHeight: '100%',
            flexDirection: 'column',
            // flexWrap: 'wrap',
          }}
        >
          {places.map((place) => (
            <li key={place.kakao_id} className="search-item">
              <div
                style={{
                  flex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(10px, 4vw, 15px)',
                    color: '#b0b0b0',
                  }}
                >
                  {place.category}
                </div>
                <strong>{place.name}</strong>
                <div style={{ color: '#B0B0B0' }}>{place.address}</div>
              </div>
              <button
                style={{ flex: 1 }}
                className="addlocation-button"
                onClick={() => handleFix(place)}
              >
                <FaPlus />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FixLocation;
