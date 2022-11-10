import { CircularProgressbar } from 'react-circular-progressbar';

type ProgressBarProps = {
  percent: number
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => {
  return (
    <CircularProgressbar
      value={percent}
      text={`${percent}%`}
      styles={{
        root: {},
        path: {
          stroke: `#00FFDF`,
          strokeLinecap: 'butt',
          transition: 'stroke-dashoffset 0.5s ease 0s',
          transform: 'rotate(0.25turn)',
          transformOrigin: 'center center',
          width: '124px'
        },
        trail: {
          stroke: '#282626',
          strokeLinecap: 'butt',
          transform: 'rotate(0.25turn)',
          transformOrigin: 'center center',
        },
        text: {
          fill: '#E0E0E0',
          fontSize: '24px',
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontFamily: 'Faktum Bold',
        },
      }}
    />
  );
};
