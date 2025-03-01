import TopDealsBox from '../components/topDealsBox/TopDealsBox';
import ChartBox from '../components/charts/ChartBox';
import { useQuery } from '@tanstack/react-query';
import {
  MdGroup,
  MdInventory2,
  MdAssessment,
  MdSwapHorizontalCircle,
} from 'react-icons/md';
import {
  fetchAllUsers,
  fetchAllPosts,
  fetchAllComments,
  fetchAllReactions,
  fetchAllNotifications,
  fetchAllEvents,
  fetchAllGroups,
} from '../api/ApiCollection';

const Home = () => {
  const queryGetTotalUsers = useQuery({
    queryKey: ['totalusers'],
    queryFn: fetchAllUsers,
  });

  const queryGetTotalProducts = useQuery({
    queryKey: ['totalposts'],
    queryFn: fetchAllPosts,
  });

  const queryGetTotalRatio = useQuery({
    queryKey: ['totalcomments'],
    queryFn: fetchAllComments,
  });

  const queryGetTotalRevenue = useQuery({
    queryKey: ['totalreactions'],
    queryFn: fetchAllReactions,
  });

  const queryGetTotalSource = useQuery({
    queryKey: ['totalnotifications'],
    queryFn: fetchAllNotifications,
  });

  const queryGetTotalRevenueByProducts = useQuery({
    queryKey: ['totalevents'],
    queryFn: fetchAllEvents,
  });

  const queryGetTotalVisit = useQuery({
    queryKey: ['totalgroups'],
    queryFn: fetchAllGroups,
  });

  return (
    <div className="home w-full p-0 m-0">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense auto-rows-[minmax(200px,auto)] xl:auto-rows-[minmax(150px,auto)] gap-3 xl:gap-3 px-0">
        
        {/* Left box with top deals */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 row-span-3 3xl:row-span-5">
          <TopDealsBox />
        </div>

        {/* 1) Total Users */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType="line"
            IconBox={MdGroup}
            title="Total Users"
            data={queryGetTotalUsers.data}            // Pass data here
            isLoading={queryGetTotalUsers.isLoading}
            isSuccess={queryGetTotalUsers.isSuccess}
          />
        </div>

        {/* 2) Total Products (Posts) */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType="line"
            IconBox={MdInventory2}
            title="Total Products"
            data={queryGetTotalProducts.data}
            isLoading={queryGetTotalProducts.isLoading}
            isSuccess={queryGetTotalProducts.isSuccess}
          />
        </div>

        {/* 3) Leads by Source (Notifications) */}
        <div className="box row-span-3 col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-5">
          <ChartBox
            chartType="pie"
            title="Leads by Source"
            data={queryGetTotalSource.data}
            isLoading={queryGetTotalSource.isLoading}
            isSuccess={queryGetTotalSource.isSuccess}
          />
        </div>

        {/* 4) Total Ratio (Comments) */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType="line"
            IconBox={MdAssessment}
            title="Total Ratio"
            data={queryGetTotalRatio.data}
            isLoading={queryGetTotalRatio.isLoading}
            isSuccess={queryGetTotalRatio.isSuccess}
          />
        </div>

        {/* 5) Total Revenue (Reactions) */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType="line"
            IconBox={MdSwapHorizontalCircle}
            title="Total Revenue"
            data={queryGetTotalRevenue.data}
            isLoading={queryGetTotalRevenue.isLoading}
            isSuccess={queryGetTotalRevenue.isSuccess}
          />
        </div>

        {/* 6) Revenue by Products (Events) */}
        <div className="box row-span-2 col-span-full xl:col-span-2 3xl:row-span-3">
          <ChartBox
            chartType="area"
            title="Revenue by Products"
            data={queryGetTotalRevenueByProducts.data}
            isLoading={queryGetTotalRevenueByProducts.isLoading}
            isSuccess={queryGetTotalRevenueByProducts.isSuccess}
          />
        </div>

        {/* 7) Total Visit (Groups) */}
        <div className="box col-span-full sm:col-span-1 xl:col-span-1 3xl:row-span-2">
          <ChartBox
            chartType="bar"
            title="Total Visit"
            data={queryGetTotalVisit.data}
            isLoading={queryGetTotalVisit.isLoading}
            isSuccess={queryGetTotalVisit.isSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
