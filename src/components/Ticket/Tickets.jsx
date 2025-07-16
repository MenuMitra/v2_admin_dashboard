import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "../common/DataTable";
import Breadcrumb from "../Breadcrumb";
import { useTickets } from "../../lib/react-query/hooks/useTickets";

function Tickets() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortCount, setSortCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    tickets,
    isLoadingTickets,
    ticketsError,
    refetchTickets,
    outlets,
    isLoadingOutlets,
  } = useTickets(selectedOutlet);

  // Initialize filteredTickets when tickets change
  React.useEffect(() => {
    setFilteredTickets(tickets);
  }, [tickets]);

  const handleSearch = (searchTerm) => {
    setSearchInput(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredTickets(tickets);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = tickets.filter((ticket) => {
      const searchableFields = [
        ticket.ticket_number,
        ticket.title,
        ticket.user_name,
        ticket.status,
        ticket.created_on,
      ];

      return searchableFields.some((field) =>
        String(field || "").toLowerCase().includes(searchLower)
      );
    });

    setFilteredTickets(filtered);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/ticket-details/${ticketId}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortCount === 0) {
        setSortOrder("asc");
        setSortCount(1);
      } else if (sortCount === 1) {
        setSortOrder("desc");
        setSortCount(2);
      } else {
        setSortField(null);
        setSortOrder("asc");
        setSortCount(0);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
      setSortCount(1);
    }
  };

  const getSortedTickets = () => {
    if (!sortField) return filteredTickets;

    return [...filteredTickets].sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";

      if (sortField === "ticket_number") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortField === "created_on") {
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400 w-4 h-4" />
      );
    }
    return sortOrder === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-1 text-brand-500 w-4 h-4" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-1 text-brand-500 w-4 h-4" />
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getSortedTickets().slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(getSortedTickets().length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const columns = [
    { field: "ticket_number", header: "Ticket Number", sortable: true },
    { field: "title", header: "Title", sortable: true },
    {
      field: "status",
      header: "Status",
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(value)}`}>
          {value?.toUpperCase() || "Unknown"}
        </span>
      ),
    },
    { field: "created_on", header: "Created On", sortable: true },
    { field: "user_name", header: "User", sortable: true },
    {
      field: "action",
      header: "Action",
      sortable: false,
      render: (_, ticket) => (
        <button
          onClick={() => handleViewTicket(ticket.ticket_id)}
          className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg bg-brand-500 px-2 py-2 font-medium text-white hover:bg-brand-600"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleOutletChange = (outletId) => {
    setSelectedOutlet(outletId);
  };

  const breadcrumbItems = [
    { label: "Home", path: "/home" },
    { label: "Tickets" },
  ];

  return (
    <div className="container mx-auto flex-grows">
      <Breadcrumb items={breadcrumbItems} />

      <DataTable
        data={filteredTickets}
        columns={columns}
        title="Tickets"
        onBackClick={() => navigate(-1)}
        showBackButton={true}
        showCreateButton={false}
        enableSearch={true}
        showSearch={true}
        searchTerm={searchInput}
        onSearchChange={handleSearch}
        searchPlaceholder="Search by ticket number, title, status..."
        enableSort={true}
        enablePagination={true}
        showOutletSelect={false}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onOutletChange={handleOutletChange}
        isLoading={isLoadingTickets}
        counts={{
          total: tickets.length,
          active: tickets.filter((t) => t.status?.toLowerCase() === "open").length,
          inactive: tickets.filter((t) => t.status?.toLowerCase() === "closed").length,
        }}
        error={ticketsError}
        emptyStateMessage={
          !searchInput
            ? "No tickets found"
            : "No tickets found matching your search criteria"
        }
        darkMode={false}
        createButton={{ show: false }}
        enableStatusFilter={false}
        statusFilter="all"
        onStatusFilterChange={(status) => {
          let filtered = tickets;
          if (status !== "all") {
            const isOpen = status === "active";
            filtered = tickets.filter((ticket) =>
              isOpen
                ? ticket.status?.toLowerCase() === "open"
                : ticket.status?.toLowerCase() === "closed"
            );
          }
          setFilteredTickets(filtered);
          setCurrentPage(1);
        }}
        statusField="status"
        onReload={refetchTickets}
        isReloading={isLoadingTickets}
      />
    </div>
  );
}

export default Tickets;
