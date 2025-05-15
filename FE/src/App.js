import { useState } from 'react';
import './App.css';
import Plan from './pages/Plan';
import PlanMobile from './mobile-pages/PlanMobile';
import MainMobile from './mobile-pages/MainMobile';
import { Routes, Route } from 'react-router-dom';
import useResponsive from './useResponsive';
import GridLines from 'react-gridlines';
import Main from './pages/Main';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Loading from './component/Loading';
import './index.css';
import { PlanContext } from './context/PlanContext';
import { SelectedDayContext } from './context/SelectedDayContext';

function App() {
  const { isMobile } = useResponsive();
  const [data, setData] = useState(null);
  const [maxId, setMaxId] = useState(0);
  const [planName, setPlanName] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <GridLines
      className="grid-area"
      cellWidth={20}
      strokeWidth={0.5}
      color="EFEFEF"
    >
      <PlanContext.Provider
        value={{ data, setData, maxId, setMaxId, planName, setPlanName }}
      >
        <SelectedDayContext.Provider value={{ selectedDay, setSelectedDay }}>
          {isMobile ? (
            <Routes>
              <Route path="/plan" element={<PlanMobile />} />
              <Route path="/main" element={<MainMobile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/" element={<MainMobile />}></Route>
            </Routes>
          ) : (
            <Routes>
              <Route path="/plan" element={<Plan />} />
              <Route path="/main" element={<Main />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/" element={<Main />}></Route>
            </Routes>
          )}
        </SelectedDayContext.Provider>
      </PlanContext.Provider>
    </GridLines>
  );
}

export default App;
