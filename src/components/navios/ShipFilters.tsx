"use client";
import React from "react";
import { Card, Select, Space, Input, Tag, Button } from "antd";
import { SearchOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import {
    ShipType,
    ShipStatus,
    shipTypeLabels,
    shipStatusLabels,
    shipStatusColors,
} from "@/services/shipService";

const { Option } = Select;

export interface ShipFiltersState {
    search: string;
    type: ShipType | "all";
    status: ShipStatus | "all";
    sortBy: "arrival" | "name" | "size";
}

interface ShipFiltersProps {
    filters: ShipFiltersState;
    onFiltersChange: (filters: ShipFiltersState) => void;
    totalCount: number;
    filteredCount: number;
}

export default function ShipFilters({
    filters,
    onFiltersChange,
    totalCount,
    filteredCount,
}: ShipFiltersProps) {
    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, search: value });
    };

    const handleTypeChange = (value: ShipType | "all") => {
        onFiltersChange({ ...filters, type: value });
    };

    const handleStatusChange = (value: ShipStatus | "all") => {
        onFiltersChange({ ...filters, status: value });
    };

    const handleSortChange = (value: "arrival" | "name" | "size") => {
        onFiltersChange({ ...filters, sortBy: value });
    };

    const handleClearFilters = () => {
        onFiltersChange({
            search: "",
            type: "all",
            status: "all",
            sortBy: "arrival",
        });
    };

    const hasActiveFilters =
        filters.search !== "" ||
        filters.type !== "all" ||
        filters.status !== "all";

    return (
        <Card
            style={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                marginBottom: "24px",
            }}
            styles={{
                body: { padding: "16px 20px" },
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Space wrap size={12}>
                    <Input
                        placeholder="Buscar por nome ou IMO..."
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={{ width: 220 }}
                        allowClear
                    />

                    <Select
                        value={filters.type}
                        onChange={handleTypeChange}
                        style={{ width: 160 }}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="all">Todos os tipos</Option>
                        {Object.entries(shipTypeLabels).map(([key, label]) => (
                            <Option key={key} value={key}>
                                {label}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        value={filters.status}
                        onChange={handleStatusChange}
                        style={{ width: 180 }}
                    >
                        <Option value="all">Todos os status</Option>
                        {Object.entries(shipStatusLabels).map(([key, label]) => (
                            <Option key={key} value={key}>
                                <Tag color={shipStatusColors[key as ShipStatus]} style={{ margin: 0 }}>
                                    {label}
                                </Tag>
                            </Option>
                        ))}
                    </Select>

                    <Select
                        value={filters.sortBy}
                        onChange={handleSortChange}
                        style={{ width: 150 }}
                    >
                        <Option value="arrival">Mais recentes</Option>
                        <Option value="name">Nome A-Z</Option>
                        <Option value="size">Maior porte</Option>
                    </Select>
                </Space>

                <Space>
                    {hasActiveFilters && (
                        <Button
                            type="text"
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            size="small"
                        >
                            Limpar filtros
                        </Button>
                    )}
                    <Tag color={filteredCount < totalCount ? "blue" : "default"}>
                        {filteredCount} de {totalCount} navios
                    </Tag>
                </Space>
            </div>
        </Card>
    );
}
