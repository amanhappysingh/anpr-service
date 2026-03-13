import { getVehicleLogs } from '@/api/vehicle.api';
import { DataTableDemo } from '@/components/DataTable';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useQuery } from '@tanstack/react-query';
import { Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

const PAGE_SIZE = 20;

export default function Logs() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vehicle-logs', page],
        queryFn: () => getVehicleLogs({ page, skip: PAGE_SIZE }),
        keepPreviousData: true, // smooth pagination - prev data stays while fetching next
    });

    const logs = data?.data || [];
    const totalCount = data?.total || 0;         // backend se total count aana chahiye
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleView = (item) => {
        console.log("View:", item);
    };

    const handleDelete = (id) => {
        console.log("Delete:", id);
    };

    const columns = [
        {
            accessorKey: "vehicleNumber",
            header: "Vehicle Number",
            cell: ({ row }) => row.getValue("vehicleNumber") || "—",
        },
        {
            accessorKey: "vehicleType",
            header: "Vehicle Type",
            cell: ({ row }) => (
                <span className="px-2 py-1 text-xs rounded bg-gray-100">
                    {row.getValue("vehicleType") || "—"}
                </span>
            ),
        },
        {
            accessorKey: "timingIn",
            header: "Timing In",
            cell: ({ row }) =>
                row.getValue("timingIn")
                    ? new Date(row.getValue("timingIn")).toLocaleString()
                    : "—",
        },
        {
            accessorKey: "timingOut",
            header: "Timing Out",
            cell: ({ row }) =>
                row.getValue("timingOut")
                    ? new Date(row.getValue("timingOut")).toLocaleString()
                    : "—",
        },
        {
            accessorKey: "numberPlateImage",
            header: "Number Plate",
            cell: ({ row }) => (
                <img
                    src={row.getValue("numberPlateImage")}
                    alt="Number Plate"
                    className="w-24 h-16 object-cover rounded border"
                />
            ),
        },
        {
            accessorKey: "vehicleImage",
            header: "Vehicle Photo",
            cell: ({ row }) => (
                <img
                    src={row.getValue("vehicleImage")}
                    alt="Vehicle"
                    className="w-24 h-16 object-cover rounded border"
                />
            ),
        },
        {
            accessorKey: "_id",
            header: "Detection ID",
            cell: ({ row }) => (
                <div className="truncate max-w-[180px] text-xs text-gray-500">
                    {row.getValue("_id")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex flex-1">
                <div className="p-2 md:p-10 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <div className="flex items-center justify-center h-32">
                        <div>Loading logs...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-1">
                <div className="p-2 md:p-10 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <div className="flex items-center justify-center h-32">
                        <div className="text-red-500">Error: {error.message}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-1">
                <div className="p-2 md:p-10 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <Outlet />

                    {/* Search bar */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search..."
                                value={globalFilter ?? ""}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <DataTableDemo
                        columns={columns || []}
                        data={logs}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-2 py-4">
                        <div className="text-sm text-gray-500">
                            Page <span className="font-medium">{page}</span> of{" "}
                            <span className="font-medium">{totalPages || "—"}</span>
                            {totalCount > 0 && (
                                <span className="ml-2 text-gray-400">({totalCount} total)</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Prev
                            </Button>

                            {/* Page number buttons — show upto 5 pages around current */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => Math.abs(p - page) <= 2)
                                .map((p) => (
                                    <Button
                                        key={p}
                                        variant={p === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPage(p)}
                                        className="min-w-[36px]"
                                    >
                                        {p}
                                    </Button>
                                ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Vehicle Log"
                size="sm"
                showCloseButton={true}
                closeOnBackdrop={true}
                closeOnEscape={true}
            >
                {/* detail view yahan */}
            </Modal>
        </>
    );
}