import React from "react";

export default function FlowMapWebGL() {
  const legacyUrl =
    `${import.meta.env.BASE_URL}legacy_project/flowmap_webgl/index.html`;

  return (
    <iframe
      src={legacyUrl}
      title="WebGPU Watershed Flow Map"
      className="
        block
        h-full
        w-full
        border-0
      "
    />
  );
}