import TransactionsTable from "../../common/components/SISTransactionsTable";
import PageHeader from "../../common/components/PageHeader";
import { Import, Plus } from "lucide-react";

const TransactionsPage = () => {
  return (
    <>
      <PageHeader
        title="Transactions"
        button={[
          {
            name: "Add Transaction",
            icon: Plus,
            bgColor: "bg-blue-600",
            link: "/transactions/create",
          },
          {
            name: "Import Transactions",
            icon: Import,
            bgColor: "bg-blue-800",
            link: "#",
          },
        ]}
      />
      <div className="bg-white border border-gray-200 m-3 py-4 h-full rounded-xl shadow-md">
        <TransactionsTable isSelect={false} isGlobal={true} />
      </div>
    </>
  );
};

export default TransactionsPage;
