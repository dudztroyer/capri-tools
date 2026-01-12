"use client";
import React, { useState } from "react";

interface JsonViewerProps {
    data: unknown;
    initialExpanded?: boolean;
    rootName?: string;
}

interface JsonNodeProps {
    name: string;
    value: unknown;
    level: number;
    initialExpanded: boolean;
}

const styles = {
    container: {
        fontFamily: "'Fira Code', 'Consolas', monospace",
        fontSize: "12px",
        lineHeight: "1.6",
        background: "#1e1e1e",
        color: "#d4d4d4",
        padding: "16px",
        borderRadius: "8px",
        maxHeight: "500px",
        overflow: "auto",
    },
    key: {
        color: "#9cdcfe",
    },
    string: {
        color: "#ce9178",
    },
    number: {
        color: "#b5cea8",
    },
    boolean: {
        color: "#569cd6",
    },
    null: {
        color: "#569cd6",
        fontStyle: "italic" as const,
    },
    bracket: {
        color: "#ffd700",
    },
    toggle: {
        cursor: "pointer",
        userSelect: "none" as const,
        marginRight: "4px",
        color: "#808080",
        display: "inline-block",
        width: "12px",
    },
    collapsedPreview: {
        color: "#808080",
        fontStyle: "italic" as const,
    },
};

function JsonNode({ name, value, level, initialExpanded }: JsonNodeProps) {
    const [expanded, setExpanded] = useState(initialExpanded && level < 2);
    const indent = level * 16;

    const isObject = value !== null && typeof value === "object";
    const isArray = Array.isArray(value);

    if (!isObject) {
        // Primitive value
        let valueStyle: { color: string; fontStyle?: "italic" } = styles.null;
        let displayValue: string;

        if (typeof value === "string") {
            valueStyle = styles.string;
            displayValue = `"${value}"`;
        } else if (typeof value === "number") {
            valueStyle = styles.number;
            displayValue = String(value);
        } else if (typeof value === "boolean") {
            valueStyle = styles.boolean;
            displayValue = String(value);
        } else {
            displayValue = "null";
        }

        return (
            <div style={{ paddingLeft: indent }}>
                {name && (
                    <>
                        <span style={styles.key}>&quot;{name}&quot;</span>
                        <span style={styles.bracket}>: </span>
                    </>
                )}
                <span style={valueStyle}>{displayValue}</span>
            </div>
        );
    }

    // Object or Array
    const entries = isArray
        ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
        : Object.entries(value as Record<string, unknown>);

    const openBracket = isArray ? "[" : "{";
    const closeBracket = isArray ? "]" : "}";
    const itemCount = entries.length;

    const toggleExpand = () => setExpanded(!expanded);

    return (
        <div>
            <div style={{ paddingLeft: indent }}>
                <span style={styles.toggle} onClick={toggleExpand}>
                    {expanded ? "▼" : "▶"}
                </span>
                {name && !isArray && (
                    <>
                        <span style={styles.key}>&quot;{name}&quot;</span>
                        <span style={styles.bracket}>: </span>
                    </>
                )}
                {name && isArray && (
                    <>
                        <span style={styles.key}>&quot;{name}&quot;</span>
                        <span style={styles.bracket}>: </span>
                    </>
                )}
                <span style={styles.bracket}>{openBracket}</span>
                {!expanded && (
                    <span style={styles.collapsedPreview}>
                        {" "}{itemCount} {isArray ? "items" : "keys"}{" "}
                    </span>
                )}
                {!expanded && <span style={styles.bracket}>{closeBracket}</span>}
            </div>
            {expanded && (
                <>
                    {entries.map(([key, val], idx) => (
                        <React.Fragment key={key}>
                            <JsonNode
                                name={isArray ? "" : key}
                                value={val}
                                level={level + 1}
                                initialExpanded={initialExpanded}
                            />
                            {idx < entries.length - 1 && (
                                <span style={{ paddingLeft: indent + 16, color: "#808080" }}>,</span>
                            )}
                        </React.Fragment>
                    ))}
                    <div style={{ paddingLeft: indent }}>
                        <span style={styles.bracket}>{closeBracket}</span>
                    </div>
                </>
            )}
        </div>
    );
}

export default function JsonViewer({ data, initialExpanded = true, rootName }: JsonViewerProps) {
    if (data === undefined) {
        return (
            <div style={styles.container}>
                <span style={styles.null}>undefined</span>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <JsonNode
                name={rootName || ""}
                value={data}
                level={0}
                initialExpanded={initialExpanded}
            />
        </div>
    );
}
