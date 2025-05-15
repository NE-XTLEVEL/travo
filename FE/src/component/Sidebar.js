import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useContext,
} from 'react';
import styles from './Sidebar.module.css';
import { PiSignOut } from 'react-icons/pi';
import AuthAxios from './AuthAxios';
import { PlanContext } from '../context/PlanContext';
import ClipLoader from 'react-spinners/ClipLoader';
import { useNavigate } from 'react-router-dom';
import { IoIosClose } from 'react-icons/io';

const Sidebar = ({ isOpen, setIsOpen, mobile }) => {
  const navigate = useNavigate();
  const { setData, setMaxId, setPlanName } = useContext(PlanContext);
  const [plans, setPlans] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef(null);
  //mobile일 때 sidebar의 너비를 더 넓게 설정
  const side = useRef();
  const handleClose = useCallback(
    (e) => {
      if (side.current && !side.current.contains(e.target)) {
        setIsOpen(false);
      }
    },
    [setIsOpen]
  ); // setIsOpen이 변경될 때만 handleClose를 새로 정의함

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('mousedown', handleClose);
    } else {
      window.removeEventListener('mousedown', handleClose);
    }

    return () => {
      window.removeEventListener('mousedown', handleClose);
    };
  }, [isOpen, handleClose]);
  const loadMore = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);

    AuthAxios.get(`plan/all${cursor === 0 ? '' : `?cursor=${cursor}`}`)
      .then((res) => {
        console.log(res);
        const result = res.data;

        setPlans((prev) => [...prev, ...result]);

        if (result.length === 0) {
          setCursor(1);
        } else {
          setCursor(result[result.length - 1].id);
        }
      })
      .catch((error) => {
        console.error('데이터 불러오기 오류:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [cursor, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !(cursor === 1)) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMore, cursor]);
  useEffect(() => {
    if (isOpen) {
      setPlans([]); // 이전 목록 제거
      setCursor(0); // 커서 초기화
    }
  }, [isOpen]);
  useEffect(() => {
    if (isOpen && cursor === 0) {
      loadMore();
    }
  }, [cursor, isOpen, loadMore]);
  const handleLogOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (window.location.pathname === '/main') {
      window.location.reload(); // 현재 페이지 새로고침
    } else {
      navigate('/main'); // 다른 페이지면 /main으로 이동
    }
  };
  const handlePlanData = (id) => {
    AuthAxios.get(`/plan/${id}`)
      .then((res) => {
        console.log(res);
        setData(res.data.data);
        setMaxId(res.data.max_id);
        setPlanName(res.data.plan_name);
        navigate(`/Plan?planId=${id}`);
        setIsOpen(false);
      })
      .catch((err) => console.error(err));
  };
  return (
    <div className={styles.container}>
      <div
        ref={side}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          minWidth: '250px',
          maxWidth: '400px',
          width: mobile ? '60vw' : '25vw',
          backgroundColor: 'white',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.5s ease',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          borderLeft: '1px solid #B0B0B0',
          boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
          <IoIosClose size={30} color="#B0B0B0" />
        </button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '85%',
            overflow: 'hidden', // ✅ 이게 중요!
            marginTop: '50px',
          }}
        >
          <div
            className={styles.scrollArea}
            style={{
              flex: 1,
              overflowY: 'auto',
            }}
          >
            <div className={styles.content}>
              {plans.map((plan) => (
                <div key={plan.id} className="search-item">
                  <button
                    style={{ background: 'none', border: 'none' }}
                    onClick={() => handlePlanData(plan.id)}
                  >
                    {plan.plan_name}
                  </button>
                </div>
              ))}

              {/* ✅ 로딩 스피너 */}
              {isLoading && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '10px 0',
                  }}
                >
                  <ClipLoader size={24} color="#9c63e1" />
                </div>
              )}

              {/* ✅ IntersectionObserver용 */}
              <div ref={loaderRef} style={{ height: '1px' }} />
            </div>
          </div>
        </div>

        {/* ✅ 하단 고정 버튼 */}
        <button className={styles.logoutButton} onClick={handleLogOut}>
          <PiSignOut />
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
