import logo from './logo.png';
import avatar from './avatar_male.png';
import './App.css';

function App() {
  return (
    <div className="card main_card">
      <div className="card-body main_card-body" style={{ height: "720px" }}>
        <div className="row h-100" id="menu">
          <div className="col-md-2 d-flex flex-column border">
            <img src={logo} className="logo" alt="logo" />
            {/* <hr> */}
            <span className="sidebar-title">Personal</span>
            <div id="sidebar"></div>
            <p className="sidebar-item mt-auto logout"><i className="fas fa-sign-out-alt"></i><span className="ms-1">Logout</span></p>
          </div>
          <div className="col-md-10 d-flex flex-column w-82">
            <div className="d-flex justify-content-between align-items-center">
              <span className="selected-page ml-15"><span id="page-title">Overview</span></span>
              <div>
                <span className="username align-middle">
                  <span id="playerName"></span> <span id="avatar"><img src={avatar} className="avatar" alt="avatar" /></span>
                </span>
                <div className="fs-14" style={{ marginTop: -12, position: "absolute", right: "7.2%" }}>
                  <span>Wallet: <span id="wallet_money"></span> EUR</span>
                </div>
              </div>
            </div>
            {/* <hr> */}
            <div className="row" id="page_info"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
