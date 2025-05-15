import { /*useEffect,*/ useState, useContext } from 'react';
import './AddLocation.css';
import { FaPlus } from 'react-icons/fa6';
import { FiSearch } from 'react-icons/fi';
import { BeatLoader } from 'react-spinners';
import { PlanContext } from '../context/PlanContext';
import authAxios from './AuthAxios';

const AddLocation = ({ dayId, close }) => {
  const { data, setData, maxId, setMaxId } = useContext(PlanContext);
  const dayPlan = data[`day${dayId}`];
  const [places, setPlaces] = useState([]);
  const [keyWord, setKeyWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const planId = Number(queryParams.get('planId'));
  const searchPlaces = (keyWord) => {
    if (!window.kakao || !window.kakao.maps) return;

    // const options = {
    //   location: new window.kakao.maps.LatLng(
    //     37.58629750845203,
    //     127.02922775537017
    //   ),
    //   radius: 20000,
    //   sort: window.kakao.maps.services.SortBy.DISTANCE,
    // };

    const ps = new window.kakao.maps.services.Places();
    setLoading(true);
    ps.keywordSearch(
      keyWord,
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setPlaces(data);
          setNoResult(false);
          setLoading(false);
          console.log('검색 완료', data);
        } else {
          setPlaces([]);
          setLoading(false);
          setNoResult(true);
          console.log('검색 결과 없음');
        }
      }
      /*options*/
    );
  };
  /* eslint-disable camelcase */
  const handleAdd = (place) => {
    if (!dayPlan?.some((prevPlace) => prevPlace.kakao_id === place.id)) {
      const updated = {
        ...data,
        [`day${dayId}`]: [
          ...dayPlan,
          {
            kakao_id: Number(place.id),
            name: place.place_name,
            address: place.address_name,
            url: place.place_url,
            x: parseFloat(place.x),
            y: parseFloat(place.y),
            category: place.category_group_name,
            local_id: maxId + 1,
          },
        ],
      };
      console.log(updated);
      setData(updated);
      setMaxId(maxId + 1);
      close();
      authAxios
        .put(`/plan/${planId}`, {
          data: updated,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.log('이미 있는 장소입니다.');
      console.log(dayPlan);
      close();
    }
  };
  /* eslint-disable camelcase */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchPlaces(keyWord);
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
        }}
      >
        <div style={{ fontSize: 'clamp(15px,2vh,40px)' }}>
          추가하고 싶은 장소를 검색해보세요
        </div>
      </div>

      {/* 2. 검색창 영역 (10%) */}
      <div
        style={{
          flex: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '90%',
            height: '80%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            backgroundColor: '#EFEFEF',
            borderRadius: '10px',
          }}
        >
          <input
            className="searchbar"
            style={{ fontSize: '100%', outline: 'none' }}
            value={keyWord}
            onChange={(e) => setKeyWord(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <FiSearch
            onClick={() => searchPlaces(keyWord)}
            style={{ cursor: 'pointer', scale: '1.5' }}
          />
        </div>
      </div>

      {/* 3. 리스트 영역 (70%) */}
      <div
        className="scroll-container"
        style={{
          flex: 9,
          overflow: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {loading && (
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
        {noResult && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            검색 결과가 없습니다.{' '}
          </div>
        )}

        {!loading && !noResult && (
          <ul
            style={{
              margin: '0px',
              paddingLeft: '0px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {places.map((place) => (
              <li key={place.id} className="search-item">
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
                    {place.category_group_name}
                  </div>
                  <strong>{place.place_name}</strong>
                  <div style={{ color: '#B0B0B0' }}>{place.address_name}</div>
                </div>
                <button
                  style={{ flex: 1 }}
                  className="addlocation-button"
                  onClick={() => handleAdd(place)}
                >
                  <FaPlus />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddLocation;
