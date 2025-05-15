import { Background, LoadingText } from './LoadingStyles';
import Spinner from './assets/Spinner.gif';

const Loading = () => {
  /*
  const location = useLocation();
  const navigate = useNavigate();
  const { setData } = useContext(PlanContext);
  const { setMaxId } = useContext(MaxIdContext);

  useEffect(() => {
    const fetchData = async () => {
      const { description, startDate, days, planName } = location.state || {};
      try {
        const response = await fetch(
          'https://api.travo.kr/location/recommendation',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description,
              date: startDate,
              days,
              // eslint-disable-next-line camelcase
              plan_name: planName,
            }),
          }
        );
        if (!response.ok) {
          throw new Error('error fetching data');
        }
        const body1 = await response.json();
        const data = body1.data;
        setData(data);
        setMaxId(body1.max_id);
        // 응답 받으면 Plan 페이지로 이동
        navigate('/Plan', { state: { plan: data } });
      } catch (error) {
        console.error('Error:', error);
        alert('데이터를 가져오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
        navigate('/main');
      }
    };
    fetchData();
  }, [location.state, navigate, setData, setMaxId]);
  */

  return (
    <Background>
      <LoadingText>여행 일정을 만들고 있어요</LoadingText>
      <img src={Spinner} alt="Loading..." style={{ width: '15%' }} />
    </Background>
  );
};

export default Loading;
