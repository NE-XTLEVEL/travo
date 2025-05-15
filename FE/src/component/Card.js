import './Card.css';
import { ReactComponent as Option } from './assets/Card_option.svg';
import {
  PiForkKnife,
  PiCoffee,
  PiTrain,
  PiMoneyWavyLight,
} from 'react-icons/pi';
import { FiAlertCircle } from 'react-icons/fi';
import {
  LiaBedSolid,
  LiaBriefcaseMedicalSolid,
  LiaLandmarkSolid,
  LiaGasPumpSolid,
} from 'react-icons/lia';
import { BsCart2 } from 'react-icons/bs';
import { HiOutlineFlag } from 'react-icons/hi';
import { IoSchoolOutline, IoLocationOutline } from 'react-icons/io5';
import { HiOutlineBuildingOffice } from 'react-icons/hi2';
import { LuCircleParking } from 'react-icons/lu';
import classNames from 'classnames';
import Modal from './Modal';
import FixLocation from './FixLocation';

function CardIcons(category) {
  switch (category) {
    case '숙소':
      return <LiaBedSolid size={35} color="#B0B0B0" />;
    case '교통':
      return <PiTrain size={35} color="#B0B0B0" />;
    case '음식점':
      return <PiForkKnife size={35} color="#B0B0B0" />;
    case '카페':
      return <PiCoffee size={35} color="#B0B0B0" />;
    case '대형마트':
      return <BsCart2 size={35} color="#B0B0B0" />;
    case '편의점':
      return <BsCart2 size={35} color="#B0B0B0" />;
    case '관광명소':
      return <HiOutlineFlag size={35} color="#B0B0B0" />;
    case '문화시설':
      return <LiaLandmarkSolid size={35} color="#B0B0B0" />;
    case '어린이집,유치원':
      return <IoSchoolOutline size={35} color="#B0B0B0" />;
    case '학교':
      return <IoSchoolOutline size={35} color="#B0B0B0" />;
    case '학원':
      return <IoSchoolOutline size={35} color="#B0B0B0" />;
    case '주차장':
      return <LuCircleParking size={35} color="#B0B0B0" />;
    case '주유소':
      return <LiaGasPumpSolid size={35} color="#B0B0B0" />;
    case '충전소':
      return <LiaGasPumpSolid size={35} color="#B0B0B0" />;
    case '은행':
      return <PiMoneyWavyLight size={35} color="#B0B0B0" />;
    case '지하철역':
      return <PiTrain size={35} color="#B0B0B0" />;
    case '공공기관':
      return <HiOutlineBuildingOffice size={35} color="#B0B0B0" />;
    case '중개업소':
      return <HiOutlineBuildingOffice size={35} color="#B0B0B0" />;
    case '병원':
      return <LiaBriefcaseMedicalSolid size={35} color="#B0B0B0" />;
    case '약국':
      return <LiaBriefcaseMedicalSolid size={35} color="#B0B0B0" />;
    case '기타':
      return <IoLocationOutline size={35} color="#B0B0B0" />;
    default:
      return <FiAlertCircle size={35} color="#B0B0B0" />;
  }
}

const Card = ({
  isOverlay = false,
  item,
  notSelected,
  isModalOpen,
  setIsModalOpen,
  dayId,
}) => {
  const classes = classNames('Card', {
    OverlayCard: isOverlay,
  });

  const contentClasses = classNames('CardContent', {
    lowOpacity: notSelected, // 선택되지 않은 일차의 카드 투명도 조절
  });
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div className={classes}>
      <div className={contentClasses}>
        <div className="CardImage">{CardIcons(item.category)}</div>
        <div className="CardInfo">
          <div className="CardType">{item.category}</div>
          <div className="CardLowLine">
            <div className="CardName">{item.name}</div>
            {item.url && (
              <div
                className="CardButton"
                onMouseDown={(event) => {
                  event.stopPropagation(); // 드래그 이벤트 전파 차단
                }}
                onClick={() => window.open(item.url, '_blank')}
              >
                더보기
              </div>
            )}
          </div>
          <div className="CardAddress">{item.address}</div>
        </div>
      </div>

      <button
        className="Option"
        onMouseDown={(e) => e.stopPropagation()} //드래그 이벤트 전파 차단
        onClick={(e) => {
          e.stopPropagation();
          openModal();
        }}
        style={{ background: 'none', border: 'none' }}
      >
        <Option />
      </button>
      <Modal open={isModalOpen} close={closeModal}>
        <FixLocation item={item} close={closeModal} dayId={dayId} />
      </Modal>
    </div>
  );
};

export default Card;
