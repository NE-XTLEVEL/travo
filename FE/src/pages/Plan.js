import { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Map from '../component/Map';
import Recommendation from '../component/Recommendation';
import Header from '../component/Header';
import authAxios from '../component/AuthAxios';
import { PlanContext } from '../context/PlanContext';

const Plan = () => {
  const navigate = useNavigate();

  // Plan?planId=
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planId = Number(queryParams.get('planId')); // 로그인되어 있지 않으면 0

  const { data, setData } = useContext(PlanContext);
  const { setMaxId } = useContext(PlanContext);
  const { setPlanName } = useContext(PlanContext);

  useEffect(() => {
    const fetchData = async () => {
      if (planId === 0) {
        // 로그인하지 않은 경우
        // 로컬 스토리지에서 여행 계획 가져오기
        const planData = JSON.parse(
          window.localStorage.getItem('travo_plan_data')
        );
        const planMaxId = window.localStorage.getItem('travo_plan_max_id');
        const planName = window.localStorage.getItem('travo_plan_name');
        if (planData && planMaxId && planName) {
          setData(planData);
          setMaxId(planMaxId);
          setPlanName(planName);
        } else {
          alert('여행 계획이 생성되지 않았습니다. 다시 시도해 주세요.');
          navigate('/main');
        }
      } else {
        // 로그인한 경우
        // 서버에서 여행 계획 가져오기
        try {
          const response = await authAxios.get(`/plan/${planId}`);
          const plan = response.data;
          setData(plan.data);
          setMaxId(plan.max_id);
          setPlanName(plan.plan_name);
        } catch (error) {
          console.error('Error:', error);
          alert(
            '데이터를 가져오는 중 오류가 발생했습니다. 다시 시도해 주세요.'
          );
          navigate('/main');
        }
      }
    };

    if (data === null) {
      fetchData();
    }
  }, [data, navigate, planId, setData, setMaxId, setPlanName]);

  useEffect(() => {
    // 페이지를 나가거나 새로고침할 때 경고창 띄우기
    // planId가 0인 경우(로그인하지 않은 경우)에만 경고창을 띄우도록 설정
    if (planId === 0) {
      const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [planId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ height: '10%', boxSizing: 'border-box' }}>
        <Header />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '90%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            flex: 6,
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px 0 20px 20px',
            boxSizing: 'border-box',
          }}
        >
          <Map />
        </div>
        <div
          style={{
            flex: 4,
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'start',
            paddingRight: '20px',
            boxSizing: 'border-box',
          }}
        >
          <Recommendation planId={planId} />
        </div>
      </div>
    </div>
  );
};

export default Plan;
