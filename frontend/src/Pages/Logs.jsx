import { DataTableDemo } from '@/components/DataTable';
import Modal from '@/components/Modal';
import TabsHeader from '@/components/TabHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createMembership, fanclubList } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Outlet } from 'react-router-dom';

export default function Logs() {
    const [globalFilter, setGlobalFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [activeTab, setActiveTab] = useState("fanclublist")
    const queryClient = useQueryClient();

    const handleTabChange = (value) => {
        setActiveTab(value)
        setGlobalFilter("")
    }


    const createMutation = useMutation({
        mutationFn: (data) => createMembership(data),
        onSuccess: () => {
            queryClient.invalidateQueries(["membership"]);
            setIsModalOpen(false);
            reset();
        },
        onError: (error) => {
            console.error(error);
        },
    })


    const { data: fanclub } = useQuery({
        queryKey: ['fanclub'],
        queryFn: fanclubList,
    });

    //     const { data: membership } = useQuery({
    //     queryKey: ['membership'],
    //     queryFn: (data) => getMembership(data),
    // });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            content: '',
            state: 'active',
            write: false,
        }

    });

    const handleEdit = (user) => {
        reset(user)
        setEditingUserId(user._id);
        setIsModalOpen(true)
    }


    const handleFilterClick = () => {
        console.log("Filter clicked");
    };

    
     const tabs = [
    { value: "fanclublist", label: "Fanclub List" },
    { value: "snsfeed", label: "SNS Feed" },
    { value: "freeboard", label: "Free Board" },
  ];

  


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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(item)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item._id)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];



    // if (isLoading) {
    //     return (
    //         <div className="flex flex-1">
    //             <div className="p-2 md:p-10 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
    //                 <div className="flex items-center justify-center h-32">
    //                     <div>Loading users...</div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="flex flex-1">
    //             <div className="p-2 md:p-10 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
    //                 <div className="flex items-center justify-center h-32">
    //                     <div className="text-red-500">Error loading users: {error.message}</div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <>
            <div className="flex flex-1">
                <div className="p-2 md:p-10 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                    <Outlet />
                    <div className="flex items-center justify-between py-4">
                        {/* <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="account" className="w-[400px]">
                            <TabsList>
                                <TabsTrigger value="fanclublist">Fanclub List</TabsTrigger>
                                <TabsTrigger value="snsfeed">SNS Feed</TabsTrigger>
                                <TabsTrigger value="freeboard">Free Board</TabsTrigger>
                            </TabsList>
                        </Tabs> */}
                       

                        <div className="flex gap-2">
                            <Input
                                placeholder="Search..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="max-w-sm"
                            />
                           
                        </div>
                    </div>
                    <DataTableDemo
                        columns={columns || []}
                        data={fanclub?.data || []}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Member"
                size="sm"
                showCloseButton={true}
                closeOnBackdrop={true}
                closeOnEscape={true}
            >

            </Modal>
        </>
    )
}
