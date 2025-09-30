export default function BushfireViewer() {
  return (
    <iframe
      src={`${import.meta.env.BASE_URL}/projects/fire_viz/vtk_vis_s_w.html`}
      style={{ width: "100%", height: "100vh", border: "none" }}
      title="Bushfire Viewer"
    />
  );
}