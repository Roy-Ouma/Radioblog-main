import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LottieIllustration from "./LottieIllustration";

const Graph = ({ dt }) => {
  return (
    <ResponsiveContainer width='100%' height={400}>
      {dt?.length > 0 ? (
        <AreaChart data={dt}>
          <XAxis dataKey='_id' />
          <YAxis />
          <Tooltip />
          <Area
            type='monotone'
            dataKey='Total'
            stroke='#8884d8'
            fill='#8884d8'
          />
        </AreaChart>
      ) : (
        <div className='w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6'>
          <div className='w-64 h-40'>
            <LottieIllustration src={'https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json'} />
          </div>

          <div className='max-w-md'>
            <p className='text-slate-700 dark:text-slate-300 font-medium'>No data to display</p>
            <p className='text-sm text-slate-500 dark:text-slate-400'>Try selecting a different date range or check data ingestion.</p>
          </div>
        </div>
      )}
    </ResponsiveContainer>
  );
};

export default Graph;
