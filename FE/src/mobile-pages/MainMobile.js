import { useState, useContext } from 'react';
import moment from 'moment';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './MainMobile.css';
import CustomCalendar from '../component/CustomCalendar';

import authAxios from '../component/AuthAxios';
import { PlanContext } from '../context/PlanContext';
import { SelectedDayContext } from '../context/SelectedDayContext';
import Header from '../component/Header';
import Loading from '../component/Loading';

import { useNavigate } from 'react-router-dom';
import { MdPeopleOutline } from 'react-icons/md';
import { LuSend } from 'react-icons/lu';
import intro1 from './assets/intro1.svg';
import intro2 from './assets/intro2.svg';
import intro3 from './assets/intro3.svg';

const MainMobile = () => {
  const navigate = useNavigate();
  // Calendar에서 시작, 끝 날짜 받아와서 적용
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [prompt, setPrompt] = useState(''); // 프롬프트

  //slider option
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // 서버로 데이터 request 보내기
  const { setData } = useContext(PlanContext);
  const { setSelectedDay } = useContext(SelectedDayContext);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const handleSubmit = async () => {
    setIsLoading(true); // 로딩 시작
    setData(null);
    setSelectedDay(0);
    const days = moment(endDate).diff(moment(startDate), 'days') + 1;
    const startDateFormatted = moment(startDate).format('YYYY-MM-DD'); // 서버에 보낼 시작 날짜
    const planName = moment(startDate).isSame(endDate, 'day')
      ? `${moment(startDate).format('MM.DD(ddd)')} 여행`
      : `${moment(startDate).format('MM.DD')}-${moment(endDate).format('MM.DD')} 여행`;
    const getRecommendation = async () => {
      try {
        console.log('loading....');
        const response = await authAxios.post('/location/recommendation', {
          description: prompt,
          date: startDateFormatted,
          days: days,
          // eslint-disable-next-line camelcase
          plan_name: planName,
        });

        const plan = response.data;
        const planId = plan.plan_id || 0; // 로그인하지 않아 planId가 null인 경우 0으로 설정
        window.localStorage.setItem('travo_plan_name', planName);
        window.localStorage.setItem(
          'travo_plan_data',
          JSON.stringify(plan.data)
        );
        window.localStorage.setItem('travo_plan_max_id', plan.max_id);
        navigate(`/Plan?planId=${planId}`);
      } catch (error) {
        console.error('Error:', error);
        alert('데이터를 가져오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
        navigate('/main');
      }
    };
    getRecommendation();
  };
  const handleDateChange = (start, end) => {
    //CustomCalendar에서 start, end date 받아오면 값 바꿔줌
    setStartDate(start);
    setEndDate(end);
  };
  // 날짜 범위가 10일을 초과할 경우 경고창 띄우기
  const handleInvalidRange = () => {
    alert('최대 10일까지 선택 가능합니다.');
  };
  const FormattingDate = (date) => {
    return moment(date).format('YYYY.MM.DD(ddd)');
  };
  /*인원수 input 받기*/
  const [peopleCount, setPeopleCount] = useState(2);
  const [showInput, setShowInput] = useState(false);

  const handleIconClick = () => {
    setShowInput(!showInput);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div
      className="mobile-body"
      style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}
    >
      <div style={{ height: '8%', boxSizing: 'border-box' }}>
        <Header mobile={true} main={true} />
      </div>
      <Slider
        {...settings}
        style={{
          height: '57%',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          adaptiveHeight: true,
          useTransform: false,
        }}
      >
        <div>
          <img src={intro1}></img>
        </div>
        <div>
          <img src={intro2}></img>
        </div>
        <div>
          <img src={intro3}></img>
        </div>
      </Slider>
      <div className="mobile-bottom" style={{ height: '35%' }}>
        <div
          style={{
            width: '62.5vw',
            minWidth: '300px',
            paddingLeft: '15px',
            paddingBottom: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '14px',
            }}
          >
            <CustomCalendar
              onDateChange={handleDateChange}
              onInvalidRange={handleInvalidRange}
              mobile={true}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{FormattingDate(startDate)}</span> ~{' '}
              <span>{FormattingDate(endDate)}</span>
            </div>
          </div>

          <div
            className="OptionPeople"
            style={{ position: 'relative', zIndex: '3' }}
          >
            <MdPeopleOutline
              size={'5vw'}
              onClick={handleIconClick}
              style={{ cursor: 'pointer' }}
              fontWeight={800}
            />
            <div style={{ fontSize: '15px' }}>{peopleCount}명</div>
            {showInput && (
              <input
                type="number"
                min="1"
                max="10"
                value={peopleCount}
                onChange={(e) => {
                  const value = e.target.value;

                  // 숫자 아닌 값은 무시
                  if (!/^\d*$/.test(value)) return;

                  const num = parseInt(value, 10);

                  if (value === '') {
                    // 빈 문자열 허용 (입력 중)
                    setPeopleCount('');
                  } else if (num === 0) {
                    alert('최소 1명 이상 입력해주세요.');
                    setPeopleCount('1');
                  } else if (num > 10) {
                    alert('최대 10명까지 가능합니다.');
                    setPeopleCount('10');
                  } else {
                    setPeopleCount(value);
                  }
                }}
                onBlur={() => setShowInput(false)}
                style={{
                  position: 'absolute',
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  top: '2.7vw',
                  left: '0',
                  width: '4rem',
                  padding: '0.3rem',
                  fontSize: '1rem',
                  zIndex: 10,
                }}
              />
            )}
          </div>
        </div>

        <div className="MainPrompt" style={{ padding: '3px', gap: '15px' }}>
          <textarea
            className="MainPromptInput"
            style={{ height: '90%' }}
            type="text"
            placeholder="잠실로 산뜻한 봄 여행을 떠나고 싶어."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 줄바꿈 막고
                handleSubmit(); // 제출
              }
            }}
          ></textarea>
          <LuSend
            size={'5vw'}
            stroke="#030045"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default MainMobile;
