"use client";
import React from "react";
import { Card, Row, Col } from "antd";

export default function ALanchaPassa() {
  return (
    <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
      <Col xs={24} md={12}>
        <Card title="Card 1" style={{ height: "100%" }}>
          <p>Content for the left card</p>
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card title="Card 2" style={{ height: "100%" }}>
          <p>Content for the right card</p>
        </Card>
      </Col>
    </Row>
  );
}

