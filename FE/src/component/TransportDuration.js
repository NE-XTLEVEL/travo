import './TransportDuration.css';

const TransportDuration = ({ duration }) => {
  return (
    <div className="TransportContainer">
      <div className="TransportLine"></div>
      <div className="TransportTime">
        {duration ?? ''}
        {duration && duration !== '도보 이동' && '분'}
      </div>
    </div>
  );
};

export default TransportDuration;
