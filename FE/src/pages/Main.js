import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderMain from '../component/Header';
import './Main.css';
import Main2 from './Main2';
import Footer from '../component/Footer';
import '../component/Footer.css';
import '../component/CustomCalendar';
import authAxios from '../component/AuthAxios';
import { MdPeopleOutline, MdKeyboardArrowDown } from 'react-icons/md';
import { LuSend } from 'react-icons/lu';
import mainDescriptionImg from './assets/mainDescription.svg';
import mainPhonePCImg from './assets/mainPhonePCImg.svg';
import CustomCalendar from '../component/CustomCalendar';
import Loading from '../component/Loading';
import { PlanContext } from '../context/PlanContext';
import { SelectedDayContext } from '../context/SelectedDayContext';
import moment from 'moment';
import 'moment/locale/ko';
moment.locale('ko');

const Main = () => {
  // scrollY 값에 따라 Header 스타일 변경
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setIsSticky(scrollTop > 0);
    };

    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleScroll = () => {
    setIsSticky(window.scrollY || document.documentElement.scrollTop);
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Calendar에서 시작, 끝 날짜 받아와서 적용
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleDateChange = (start, end) => {
    //CustomCalendar에서 start, end date 받아오면 값 바꿔줌
    setStartDate(start);
    setEndDate(end);
  };
  // 날짜 범위가 10일을 초과할 경우 경고창 띄우기
  const handleInvalidRange = () => {
    alert('최대 10일까지 선택 가능합니다.');
  };
  // 'YYYY.MM.DD(d)' 형식으로 date 변환
  const FormattingDate = (date) => {
    return moment(date).format('YYYY.MM.DD(ddd)');
  };
  /*인원수 input 받기*/
  const [peopleCount, setPeopleCount] = useState('2');
  const [showInput, setShowInput] = useState(false);

  const handleIconClick = () => {
    setShowInput(!showInput);
  };
  // 서버로 데이터 request 보내기
  const { setData } = useContext(PlanContext);
  const { setSelectedDay } = useContext(SelectedDayContext);
  const [prompt, setPrompt] = useState(''); // 프롬프트
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const navigate = useNavigate();
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="MainContainer" ref={containerRef}>
        <div className="Main" id="firstPage">
          <div className={isSticky ? 'MainHeader-sticky' : 'MainHeader'}>
            <HeaderMain main={true} style={{ position: 'sticky' }} />
          </div>
          <div style={{ width: '100vw' }}>
            <div className="MainImage">
              <img
                className="MainDescription wow fadeInLeft delay-05s animated"
                src={mainDescriptionImg}
                alt="MainDescription"
                draggable="false"
              ></img>
              <img
                className="MainPhonePCImg wow fadeInUp delay-05s animated"
                src={mainPhonePCImg}
                alt="mainPhonePCImg"
                draggable="false"
              ></img>
            </div>
            <div className="MainContent">
              <div className="MainOption">
                <div className="OptionDate">
                  <CustomCalendar
                    onDateChange={handleDateChange}
                    onInvalidRange={handleInvalidRange}
                  />
                  <div>
                    <span>{FormattingDate(startDate)}</span> ~{' '}
                    <span>{FormattingDate(endDate)}</span>
                  </div>
                </div>
                <div className="OptionPeople" style={{ position: 'relative' }}>
                  <MdPeopleOutline
                    size={'3vw'}
                    onClick={handleIconClick}
                    style={{ cursor: 'pointer' }}
                  />
                  <div>{peopleCount}명</div>
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
              <div className="MainPrompt">
                <textarea
                  className="MainPromptInput"
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
                  size={'3vw'}
                  stroke="#030045"
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                  onClick={handleSubmit}
                />
              </div>
              <div className="MainBelowButton">
                <MdKeyboardArrowDown
                  className="Bouncing-arrow"
                  size={'3.75vw'}
                  color="#B0B0B0"
                  onClick={() => {
                    const secondPage = document.getElementById('secondPage');
                    secondPage.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="Main2" id="secondPage">
          <Main2 />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Main;
