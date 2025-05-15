import { useEffect, useRef, useContext } from 'react';
import './Map.css';
import { PlanContext } from '../context/PlanContext';
import { SelectedDayContext } from '../context/SelectedDayContext';

const MapComponent = ({ isMobile = false }) => {
  const { data } = useContext(PlanContext);
  const { selectedDay } = useContext(SelectedDayContext);
  const mapRef = useRef(null);

  useEffect(() => {
    /**
     *
     * InitMap 함수
     * 1) Kakao Map 초기화
     * 2) 마커 설정
     * 3) 선 설정
     *
     * @param {*} markerData :
     */
    const InitMap = (markerData) => {
      // 1) Kakao Map 초기화
      if (window.kakao && window.kakao.maps) {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.978), // 지도 초기 중심 좌표 (서울 시청 기준)
          level: 3, // 지도 확대/축소 레벨 (작을수록 더 확대됨)
          draggable: true, // 드래그 가능 여부
          zoomable: true, // 줌 가능 여부
        });

        // 2) 마커 설정
        const bounds = new window.kakao.maps.LatLngBounds(); // 마커들이 있는 위치를 모두 포함하는 범위 계산

        const dayColors = [
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

        Object.values(markerData).forEach((locations, dayIndex) => {
          // day 무시하고 장소 배열만 가져옴 (locations:특정 날짜의 장소 리스트, dayIndex: 날짜 인덱스)

          // 선택된 일차가 있을 경우 해당 일차의 마커만 표시
          if (selectedDay > 0 && dayIndex !== selectedDay - 1) {
            return;
          }

          const linePath = [];

          locations.forEach((loc, idx) => {
            const position = new window.kakao.maps.LatLng(loc.y, loc.x); // 장소의 위도(y), 경도(x)로 마커 위치 만듦
            linePath.push(position); // 경로 배열 -> 선 그릴 때 사용
            bounds.extend(position); // 현재 마커 bounds에 포함시킴

            const dayColor = dayColors[dayIndex % dayColors.length]; // dayIndex에 맞는 색상 지정

            const content = `
            <div style="
              background:${dayColor};
              color:white;
              width:32px;
              height:32px;
              border-radius:50%;
              display:flex;
              justify-content:center;
              align-items:center;
              font-size:14px;
              font-weight:bold;
              border:2px solid white;
              box-shadow:0 0 3px rgba(0,0,0,0.3);
            ">
              ${idx + 1}
            </div>
          `;

            new window.kakao.maps.CustomOverlay({
              position,
              content,
              xAnchor: 0.5, // 마커의 가로 기준 중앙 정렬
              yAnchor: 0.5, // 마커의 세로 기준 중앙 정렬
              map,
            });
          });

          // 3) 선 설정
          const polyline = new window.kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 4,
            strokeColor: dayColors[dayIndex % dayColors.length],
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
          });
          polyline.setMap(map);
        });

        map.setBounds(bounds); // bounds에 저장된 모든 마커 한 화면 안에 보이도록 (카카오맵 제공 메서드)

        if (isMobile) {
          const mapHeight = mapRef.current.offsetHeight;
          const offsetY = Math.floor(mapHeight * 0.3); // 지도 높이의 30%를 아래로 이동 -> 마커가 위로 올라감 -> recommendation에 덜 가림
          map.panBy(0, offsetY); // 지도를 아래로 → 마커는 화면 위쪽으로
        }
      } else {
        console.error('카카오맵 API가 로드되지 않았습니다.');
      }
    };

    /**
     * loadMapScript 함수 - Kakao Map API 스크립트 생성, 로드
     */
    const loadMapScript = (markerData) => {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&libraries=services&autoload=false`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => InitMap(markerData));
        } else {
          console.error('카카오맵 API가 정상적으로 로드되지 않았습니다.');
        }
      };
    };

    if (!window.kakao || !window.kakao.maps) {
      if (data) {
        loadMapScript(data);
      }
    } else {
      if (data) {
        window.kakao.maps.load(() => InitMap(data || {}));
      }
    }
  }, [data, selectedDay, isMobile]); // data와 selectedDay가 변경될 때마다 useEffect 실행

  // 렌더링할 JSX를 반환. React 애플리케이션
  return <div className="mapViewContainer" ref={mapRef}></div>;
};

export default MapComponent;
