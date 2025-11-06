import { useEffect } from "react";
import PageHeader from "../../common/components/PageHeader";
import { useDispatchStore } from "../../stores/useDispatchStore";
import VesselCard from "../../common/components/VesselCard";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";

const VesselOverview = () => {
  const { fetchVessels, vessels, vesselLoading } = useDispatchStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchData = async () => {
      try {
        await fetchVessels();
      } catch (error) {
        console.error("Failed to fetch vessels:", error);
      }
    };
    fetchData();
  }, []);

  const navigate = useNavigate();
  const handleVesselClick = async (id, name) => {
    navigate(`/vessel/${name}/${id}`);
  };

  return (
    <div className="min-h-screen">
      <PageHeader title={"Vessel Overview"} />
      <Spin spinning={vesselLoading} size="large" fullscreen={true}></Spin>
      <div className="min-h-screen m-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {vessels.map((vessel) => (
            <VesselCard
              key={vessel.vessel_id}
              vessel={vessel}
              onClick={() =>
                handleVesselClick(vessel.vessel_id, vessel.vessel_name)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VesselOverview;
