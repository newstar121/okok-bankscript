import logo from './logo.png';
import avatar from './avatar_male.png';
import './App.css';

function App() {
  return (
    <>
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
            <div className="col-md-10 d-flex flex-column width-82">
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
      <div className="card atm_card">
        <div className="card-body atm_card-body d-flex justify-content-center align-items-center flex-column">
          <button type="button" className="btn-close btn-close-white close-atm"></button>
          <div className="text-center">
            <img src={logo} className="logo" alt="logo"/>
          </div>
          <div className="dots d-flex">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <span className="fs-18" id="text_atm">Enter your account's PIN code</span>
          <div className="numbers">
            <div className="row">
              <div className="number">1</div>
              <div className="number">2</div>
              <div className="number">3</div>
            </div>
            <div className="row">
              <div className="number">4</div>
              <div className="number">5</div>
              <div className="number">6</div>
            </div>
            <div className="row">
              <div className="number">7</div>
              <div className="number">8</div>
              <div className="number">9</div>
            </div>
            <div className="row">
              <div className="number">C</div>
              <div className="number">0</div>
              <div className="number">OK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <div className="modal fade" id="depositModal" tabindex="-1">
        <div className="modal-dialog modal-dialog-centered w-400">
          <div className="modal-content myinvoices_modal-content">
            <div className="modal-body p-4 text-center">
              <span className="fw-600 fs-30">Deposit Money</span>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" id="closeDepositMoneyModal"></button>
              <div className="d-flex justify-content-center flex-column mt-10">
                <input type="number" id="deposit_value" className="form-control flex-grow-1 text-center" placeholder="Amount" onKeyUp="checkIfEmpty()"/>
                  <button type="button" id="depositMoney" className="btn btn-blue flex-grow-1 br-10 fbasis-100 mt-18" data-bs-toggle="modal" data-bs-target="#depositModal" disabled><i className="bi bi-upload"></i> Deposit</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <div className="modal fade" id="withdrawModal" tabindex="-1">
        <div className="modal-dialog modal-dialog-centered w-400">
          <div className="modal-content myinvoices_modal-content">
            <div className="modal-body p-4 text-center">
              <span className="fw-600 fs-30">Withdraw Money</span>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" id="closeWithdrawMoneyModal"></button>
              <div className="d-flex justify-content-center flex-column mt-10">
                <input type="number" id="withdraw_value" className="form-control flex-grow-1 text-center" placeholder="Amount" onKeyUp="checkIfEmpty()"/>
                  <button type="button" id="withdrawMoney" className="btn btn-blue flex-grow-1 br-10 fbasis-100 mt-18" data-bs-toggle="modal" data-bs-target="#withdrawModal" disabled><i className="bi bi-download"></i> Withdraw</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      <div className="modal fade" id="transferModal" tabindex="-1">
        <div className="modal-dialog modal-dialog-centered w-400">
          <div className="modal-content myinvoices_modal-content">
            <div className="modal-body p-4 text-center">
              <span className="fw-600 fs-30">Transfer Money</span>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" id="closeTransferMoneyModal"></button>
              <div className="d-flex justify-content-center flex-column mt-10">
                <input type="number" id="transfer_value" className="form-control flex-grow-1 text-center" placeholder="Amount" onKeyUp="checkIfEmpty()"/>
                  <input type="text" id="transfer_iban" className="form-control flex-grow-1 text-center mt-18" placeholder="IBAN" style={{textTransform: "uppercase"}} onKeyUp="checkIfEmpty()"/>
                    <button type="button" id="transferMoney" className="btn btn-blue flex-grow-1 br-10 fbasis-100 mt-18" data-bs-toggle="modal" data-bs-target="#transferModal" disabled><i className="fas fa-exchange-alt"></i> Transfer</button>
                  </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}

export default App;
