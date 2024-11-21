import VideoChat from "./components/VideoChat";
import VideoConferenceApp from "./components/VideoConferenceApp";


function App() {
  return (
    <div className="container max-w-[1920px] mx-auto px-10 pt-10 font-mono">
      <h1>Video Chat Application</h1>
      <VideoConferenceApp />
      {/* <VideoChat /> */}
    </div>
  );
}

export default App;