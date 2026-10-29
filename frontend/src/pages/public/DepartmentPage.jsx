import React, { useEffect, useState } from 'react';
import { getDepartementInfo, getLaboratoires, getEnseignants } from '../../api/publicApi';
import Loader from '../../components/common/Loader';
import DirectorQuote from '../../components/department/DirectorQuote';
import HistorySection from '../../components/department/HistorySection';
import QuickNav from '../../components/department/QuickNav';
import LocationCard from '../../components/department/LocationCard';
import EventsSidebar from '../../components/department/EventsSidebar';
import styles from './DepartmentPage.module.css';

const DepartmentPage = () => {
  const [deptInfo, setDeptInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info] = await Promise.all([
          getDepartementInfo(),
          getLaboratoires(),
          getEnseignants()
        ]);
        setDeptInfo(info);
      } catch (error) {
        console.error("Failed to fetch department data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader center />;

  const title = deptInfo?.titre || 'LE DÉPARTEMENT';
  const subtitle = deptInfo?.sousTitre || `À la pointe de l'innovation technologique et de l'excellence académique, le Département Informatique s'engage à former les leaders de demain.`;

  return (
    <div className={styles.page}>
      <div className="container">
        
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>
            {subtitle}
          </p>
        </header>

        <div className={styles.grid}>
          {/* Main Content (65%) */}
          <main className={styles.mainCol}>
            <DirectorQuote data={deptInfo} />
            <HistorySection data={deptInfo} />
          </main>

          {/* Right Sidebar (35%) */}
          <aside className={styles.sidebarCol}>
            <QuickNav />
            <LocationCard data={deptInfo} />
            <EventsSidebar />
          </aside>
        </div>

      </div>
    </div>
  );
};

export default DepartmentPage;
