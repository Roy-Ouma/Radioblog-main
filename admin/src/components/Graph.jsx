import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import LottieIllustration from "./LottieIllustration";

const Graph = ({ dt }) => {
  // Normalize dt to expected shape: { date: 'YYYY-MM-DD', views: number }
  const data = Array.isArray(dt)
    ? dt.map((d) => ({ date: d.date || d._id || d.label, views: d.views ?? d.Total ?? 0 }))
    : [];

  return (
    <ResponsiveContainer width='100%' height={420}>
      {data.length > 0 ? (
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis dataKey='date' tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type='monotone'
            dataKey='views'
            stroke='#8884d8'
            fillOpacity={1}
            fill='url(#colorViews)'
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
