import React, { useEffect, useState } from 'react';
import HeroSection from '../../components/home/HeroSection';
import StatsBar from '../../components/home/StatsBar';
import NewsSection from '../../components/home/NewsSection';
import ProgramsSection from '../../components/home/ProgramsSection';
import { getActualites, getFilieres } from '../../api/publicApi';
import Loader from '../../components/common/Loader';

const HomePage = () => {
  const [actualites, setActualites] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [actData, filData] = await Promise.all([
          getActualites({ limit: 6 }),
          getFilieres(),
        ]);
        setActualites(actData.slice(0, 6));
        setFilieres(filData);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return <Loader center />;

  return (
    <>
      <HeroSection />
      <StatsBar />
      <NewsSection news={actualites} />
      <ProgramsSection programs={filieres} />
    </>
  );
};

export default HomePage;
