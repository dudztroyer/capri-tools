"use client";
import React from "react";
import { Row, Col, Spin, Alert } from "antd";
import { useLanchaPassa } from "@/hooks/useLanchaPassa";
import StatusCard from "@/components/a-lancha-passa/StatusCard";
import Next7DaysCard from "@/components/a-lancha-passa/Next7DaysCard";

export default function ALanchaPassa() {
  const { data, isLoading, error } = useLanchaPassa();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erro ao carregar dados"
        description="Não foi possível obter os dados. Por favor, tente novamente mais tarde."
        type="error"
        showIcon
        style={{ marginTop: "24px" }}
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
      <Col xs={24} md={12}>
        <StatusCard data={data} />
      </Col>
      <Col xs={24} md={12}>
        <Next7DaysCard windows={data.next7Days} />
      </Col>
    </Row>
  );
}
