import { useEffect, useState, useContext, useRef } from 'react';
import { FaBars } from 'react-icons/fa6';
import { PiSignInBold } from 'react-icons/pi';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';
import authAxios from './AuthAxios';
import { PlanContext } from '../context/PlanContext';

const Header = ({ mobile = false, main = false }) => {
  const { planName, setPlanName } = useContext(PlanContext);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState(planName);
  const [debouncedInput, setDebouncedInput] = useState('');
  const [auth, setAuth] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const planId = Number(queryParams.get('planId'));
  const inputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    setInput(planName);
  }, [planName]);

  useEffect(() => {
    authAxios
      .get('/auth/check')
      .then((res) => {
        if (res.status == 200) {
          setAuth(true);
        }
      })
      .catch((error) => {
        setAuth(false);
        console.log(error);
      });
  }, []);
  useEffect(() => {
    const handler = setTimeout(() => {
      // setPlanName(input); // 화면 너비 변경될 때도 input 유지
      setDebouncedInput(input);
    }, 1000); // 500ms 후 반영

    return () => {
      clearTimeout(handler); // 다음 입력 전에 이전 타이머 취소
    };
  }, [input, setPlanName]);

  // ✅ 이 effect는 debouncedInput이 바뀔 때만 실행됨
  useEffect(() => {
    if (debouncedInput && isEdited && debouncedInput != planName) {
      authAxios
        .patch(`/plan/name/${planId}`, {
          name: input,
        })
        .then((res) => {
          console.log(res.data.message);
          setPlanName(debouncedInput);
          setIsEdited(false);
          inputRef.current.blur();
        })
        .catch((err) => {
          console.error(err);
          setIsEdited(false);
        });
      console.log('요청:', debouncedInput);
    }
  }, [debouncedInput, input, planId, setPlanName, isEdited, planName]);
  const handleInput = (e) => {
    setInput(e.target.value);
    setIsEdited(true);
  };
  return (
    <div
      style={{
        backgroundColor: main ? 'transparent' : 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <button
        style={{
          background: 'none',
          border: 'none',
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 0,
        }}
        onClick={() => navigate('/main')}
      >
        <img
          src="/logo.svg"
          width={mobile ? 25 : 40}
          style={{ margin: '10px' }}
        />
      </button>
      <div
        style={{
          flex: mobile ? 8 : 4,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {main ? (
          <div
            style={{
              padding: '10px',
              fontSize: '24px',
              color: '#030045',
              fontWeight: 700,
            }}
          >
            Travo
          </div>
        ) : (
          <input
            ref={inputRef}
            value={input}
            maxLength={19}
            onChange={(e) => handleInput(e)}
            style={{
              border: 'none',
              height: '50px',
              width: '90%',
              fontSize: mobile ? '20px' : '26px',
              fontWeight: 700,
              textAlign: 'center',
              outline: 'none',
            }}
          ></input>
        )}
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'flex-end',
          margin: '10px',
        }}
      >
        {auth ? (
          <button
            style={{
              background: 'none',
              border: 'none',
            }}
            onClick={() => setIsOpen(true)}
          >
            <FaBars size={mobile ? 20 : 30} color="#030045" />
          </button>
        ) : (
          <button
            style={{
              background: 'none',
              border: 'none',
            }}
            onClick={() => navigate('/login')}
          >
            <PiSignInBold size={mobile ? 20 : 30} color="#030045" />
          </button>
        )}
      </div>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} mobile={mobile} />
    </div>
  );
};

export default Header;
