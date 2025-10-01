import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../common/components/PageHeader";
import { useDispatchStore } from "../../stores/useDispatchStore";
import TableContainer from "../../common/TableContainer";

const DispatchedGroupedView = () => {
  const { id } = useParams();
  const [dispatchedItems, setDispatchedItems] = useState([]);
  const { fetchDispatchedItemsByVessel } = useDispatchStore();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await fetchDispatchedItemsByVessel(id);
        setDispatchedItems(items);
      } catch (error) {
        console.error("Failed to fetch dispatched items:", error);
      }
    };

    fetchItems();
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "Item Description",
        accessorKey: "name",
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Part Number",
        accessorKey: "part_number",
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Quantity",
        accessorKey: "quantity",
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Location",
        accessorKey: "location_name",
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: "Remarks",
        accessorKey: "remarks",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ getValue }) => (
          <span className="truncate block max-w-[200px]" title={getValue()}>
            {getValue()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader title={`Mv Defender ${id}`} />
      {dispatchedItems.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          No dispatched items found for this vessel.
        </div>
      ) : (
        <div className="m-3">
          <div className="space-y-8">
            {dispatchedItems.map((dispatch) => (
              <div
                key={dispatch.dispatch_id}
                className="bg-white rounded-xl shadow p-5 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                  {/* Left section: Title and Meta */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-1">
                      Dispatch #{dispatch.dispatch_id}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="text-gray-500">
                          {new Date(
                            dispatch.dispatch_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          Destination:
                        </span>
                        <span className="text-gray-500">
                          {dispatch.destination_name}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Dispatched By:
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          {dispatch.full_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right section: Status badge */}
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
                        dispatch.status === "dispatched"
                          ? "bg-blue-100 text-blue-700"
                          : dispatch.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {dispatch.status.charAt(0).toUpperCase() +
                        dispatch.status.slice(1)}
                    </span>
                  </div>
                </div>

                <TableContainer
                  isPagination={true}
                  isSelect={false}
                  isGlobalFilter={false}
                  columns={columns || []}
                  data={dispatch.items || []}
                  customPageSize={20}
                  divclassName="my-2 col-span-12 overflow-x-auto categories lg:col-span-12"
                  tableclassName="hover group dataTable w-full text-sm align-middle whitespace-nowrap no-footer"
                  theadclassName="border-y border-slate-200 dark:border-zink-500"
                  trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 
            transition-all duration-150 ease-linear group-[.hover]:hover:bg-blue-100 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
                  thclassName={`group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 
              sorting px-4 py-2.5 text-black bg-[#f9fafc] font-semibold text-left dark:text-zink-50 dark:bg-zink-600 
              dark:group-[.bordered]:border-zink-500`}
                  tdclassName="py-2 px-4 border-b border-slate-200 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
                  PaginationClassName="flex flex-col items-center mt-5 md:flex-row px-4"
                  tbodyclassName={"px-4"}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DispatchedGroupedView;
