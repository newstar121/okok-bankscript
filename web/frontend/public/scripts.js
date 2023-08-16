var table = []
var selectedWindow = "none"
var isLoggingOut = false

window.addEventListener('message', function(event) {
	switch (event.data.action) {
		case 'loading_data':
			if (selectedWindow === "none") {

				$('#menu').html(`
					<div class="d-flex justify-content-center flex-column align-items-center">
						<span class="load"></span>
						<br>
						<div style="font-size: 40px; color: #fff;">Loading Data...</div>
					</div>
				`);
				$("#menu").fadeIn();
				$(".main_card").fadeIn();
				selectedWindow = "loading_data";
			}
			break
		case 'bankmenu':
			if (selectedWindow === "loading_data") {
				$("#menu").fadeOut();

				setTimeout(function(){
					var popup_sound = new Audio('popup.mp3');
					popup_sound.volume = 0.2;
					popup_sound.play();

					if (event.data.playerSex === "0") {
						avatar = `<img src="avatar_male.png" class="avatar">`;
					} else {
						avatar = `<img src="avatar_female.png" class="avatar">`;
					}
					

					$('#menu').html(`
						<div class="col-md-2 d-flex flex-column" style="border-right: 1px solid rgba(62, 63, 75); width: 177px;">
							<img src="logo.png" class="logo">
							<hr>
							<span class="sidebar-title">Personal</span>
							<div id="sidebar"></div>
							<p class="sidebar-item mt-auto logout"><i class="fas fa-sign-out-alt"></i></i> <span class="ms-1">Logout</span></p>
						</div>
						<div class="col-md-10" style="width: 82%; display: flex; flex-direction: column;">
							<div class="d-flex justify-content-between align-items-center">
								<span class="selected-page" style="margin-left: 15px;"><span id="page-title">Overview</span></span>
								<div>
									<span class="username align-middle">
										<span id="playerName"></span> <span id="avatar">${avatar}</span>
									</span>
									<div style="font-size: 14px; margin-top: -12px; font-weight: 500; position: absolute; right: 7.2%;">
										<span>Wallet: <span id="wallet_money"></span> EUR</span>
									</div>
								</div>
							</div>
							<hr>
							<div class="row" id="page_info"></div>
						</div>
					`);
					$("#menu").fadeIn();
					overview_page_function(event);
				}, 400);
				
			}
			break
		case 'updatevalue':
			$("#playerBankMoney").html('');
			$("#playerBankMoney").html(event.data.playerBankMoney.toLocaleString());
			$("#wallet_money").html(event.data.walletMoney.toLocaleString());
			break
		case 'updateiban':
			$("#playerIBAN").html('');
			$("#playerIBAN").html(event.data.iban);
			break
		case 'overview_page':
			overview_page_function(event);
			break
		case 'transactions_page':
			for(var i=0; i<table.length; i++) {
				table[i].destroy();
				table.splice(i, 1);
			}

			$('#page-title').html('Transactions');

			if (event.data.isInSociety){
				society = `<span class="sidebar-title mt-5">Society</span>
						   <p class="sidebar-item mt-2" id="society_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
						   <p class="sidebar-item" id="society_transactions" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>`;
			} else {
				society = '';
			}

			$('#sidebar').html(`
				<p class="sidebar-item mt-2" id="overview_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
				<p class="sidebar-item selected" id="transactions_page" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>
				<p class="sidebar-item mt-2" id="settings_page" style="margin-bottom: 12px;"><i class="fas fa-cog"></i> <span class="ms-1">Settings</span></p>
				${society}
			`);

			var row = '';
			var num = event.data.db.length;
			var numOfTransactions = 0

			for(var i = 0; i < num; i++) {
				numOfTransactions++
				var db = event.data.db[i];

				// Received
				if (db.type === 'transfer' && db.receiver_identifier === event.data.identifier) {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
								<div style="margin-top: -5px;">Received</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
				// Sent
				} else if (db.type === 'transfer' && db.sender_identifier === event.data.identifier) {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								To <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
								<div style="margin-top: -5px;">Sent</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
				// Deposited
				} else if (db.type === 'deposit') {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								Into <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
								<div style="margin-top: -5px;">Deposited</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
				// Withdrawn
				} else if (db.type === 'withdraw') {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
								<div style="margin-top: -5px;">Withdrawn</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
				}

				row += `
					<tr>
						${icon}
						${data}
						<td class="align-middle" style="font-weight: 500;">${db.date}</td>
						${amount}
					</tr>
				`;
			}

			$('#page_info').removeClass('row');

			$('#page_info').html(`
				<div class="row mb-3">
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">TRANSACTIONS</h6>
						    <p class="card-text" id="totalInvoices" style="font-size: 20px;">${numOfTransactions}</p>
						  </div>
						</div>
					</div>
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">INCOME</h6>
						    <p class="card-text" id="totalIncome" style="font-size: 20px;">${event.data.graph_values[7].toLocaleString()}€</p>
						  </div>
						</div>
					</div>
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">OUTCOME</h6>
						    <p class="card-text" id="unpaidInvoices" style="font-size: 20px;">${event.data.graph_values[8].toLocaleString()}€</p>
						  </div>
						</div>
					</div>
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">EARNINGS</h6>
						    <p class="card-text" id="awaitedIncome" style="font-size: 20px;">${event.data.graph_values[9].toLocaleString()}€</p>
						  </div>
						</div>
					</div>
				</div>
				<table id="transactionsTable">
					<tbody id="transactionsData">
						<tr>
							<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>
							<td class="align-middle" style="font-weight: 500; font-size: 16px;">
								To <span style="color: #1f5eff;">Arthur James</span>
								<div style="margin-top: -5px;">Sent</div>
							</td>
							<td class="align-middle" style="font-weight: 500;">28 Aug 04:43</td>
							<td class="align-middle" style="font-weight: 500;">- 732 500 EUR</td>
						</tr>
						<tr>
							<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>
							<td class="align-middle" style="font-weight: 500; font-size: 16px;">
								Into <span style="color: #1f5eff;">Bank Account</span>
								<div style="margin-top: -5px;">Deposited</div>
							</td>
							<td class="align-middle" style="font-weight: 500;">28 Aug 04:43</td>
							<td class="align-middle" style="font-weight: 500; color: #2ecc71;">+ 57 000 EUR</td>
						</tr>
					</tbody>
				</table>
			`);

			$('#transactionsData').html(row);

			var table_id = document.getElementById('transactionsTable');
			table.push(new simpleDatatables.DataTable(table_id, {
				perPageSelect: false,
				perPage: 5,
			}));


			break
		case 'society_transactions':
			for(var i=0; i<table.length; i++) {
				table[i].destroy();
				table.splice(i, 1);
			}

			$('#page-title').html('Transactions ['+event.data.societyInfo.society_name+']');

			if (event.data.isInSociety){
				society = `<span class="sidebar-title mt-5">Society</span>
						   <p class="sidebar-item mt-2" id="society_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
						   <p class="sidebar-item selected" id="society_transactions" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>`;
			} else {
				society = '';
			}

			$('#sidebar').html(`
				<p class="sidebar-item mt-2" id="overview_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
				<p class="sidebar-item" id="transactions_page" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>
				<p class="sidebar-item mt-2" id="settings_page" style="margin-bottom: 12px;"><i class="fas fa-cog"></i> <span class="ms-1">Settings</span></p>
				${society}
			`);

			var row = '';
			var num = event.data.db.length;
			var numOfTransactions = 0

			for(var i = 0; i < num; i++) {
				numOfTransactions++
				var db = event.data.db[i];

				// Received
				if (db.type === 'transfer' && db.receiver_identifier === event.data.identifier) {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
								<div style="margin-top: -5px;">Received</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
				// Sent
				} else if (db.type === 'transfer' && db.sender_identifier === event.data.identifier) {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								To <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
								<div style="margin-top: -5px;">Sent</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
				// Deposited
				} else if (db.type === 'deposit') {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								Into <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
								<div style="margin-top: -5px;">Deposited</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
				// Withdrawn
				} else if (db.type === 'withdraw') {
					icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 10px 15px 10px 15px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
					data = `<td class="align-middle" style="font-weight: 500;">
								From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
								<div style="margin-top: -5px;">Withdrawn</div>
							</td>`;
					amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
				}

				row += `
					<tr>
						${icon}
						${data}
						<td class="align-middle" style="font-weight: 500;">${db.date}</td>
						${amount}
					</tr>
				`;
			}

			$('#page_info').removeClass('row');

			$('#page_info').html(`
				<div class="row mb-3">
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">TRANSACTIONS</h6>
						    <p class="card-text" id="totalInvoices" style="font-size: 20px;">${numOfTransactions}</p>
						  </div>
						</div>
					</div>
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">INCOME</h6>
						    <p class="card-text" id="totalIncome" style="font-size: 20px;">${event.data.graph_values[7].toLocaleString()}€</p>
						  </div>
						</div>
					</div>
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">OUTCOME</h6>
						    <p class="card-text" id="unpaidInvoices" style="font-size: 20px;">${event.data.graph_values[8].toLocaleString()}€</p>
						  </div>
						</div>
					</div>
					<div class="col col-md-3">
						<div class="card" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
						  <div class="card-body text-center">
						    <h6 class="card-title" style="font-weight: 600; font-size: 20px;">EARNINGS</h6>
						    <p class="card-text" id="awaitedIncome" style="font-size: 20px;">${event.data.graph_values[9].toLocaleString()}€</p>
						  </div>
						</div>
					</div>
				</div>
				<table id="transactionsTable">
					<tbody id="transactionsData">
						<tr>
							<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>
							<td class="align-middle" style="font-weight: 500; font-size: 16px;">
								To <span style="color: #1f5eff;">Arthur James</span>
								<div style="margin-top: -5px;">Sent</div>
							</td>
							<td class="align-middle" style="font-weight: 500;">28 Aug 04:43</td>
							<td class="align-middle" style="font-weight: 500;">- 732 500 EUR</td>
						</tr>
						<tr>
							<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>
							<td class="align-middle" style="font-weight: 500; font-size: 16px;">
								Into <span style="color: #1f5eff;">Bank Account</span>
								<div style="margin-top: -5px;">Deposited</div>
							</td>
							<td class="align-middle" style="font-weight: 500;">28 Aug 04:43</td>
							<td class="align-middle" style="font-weight: 500; color: #2ecc71;">+ 57 000 EUR</td>
						</tr>
					</tbody>
				</table>
			`);

			$('#transactionsData').html(row);

			var table_id = document.getElementById('transactionsTable');
			table.push(new simpleDatatables.DataTable(table_id, {
				perPageSelect: false,
				perPage: 5,
			}));


			break
		case 'society_page':
			society_page_function(event);
			break
		case 'settings_page':
			settings_page_function(event);
			break
		case 'atm':
			var popup_sound = new Audio('popup.mp3');
			popup_sound.volume = 0.2;
			popup_sound.play();

			atm_numpad(event.data.pin);

			$(".atm_card").fadeIn();

			selectedWindow = "atm";
			break
		default: break;	
	}
});

// Start Pages

// Overview
$(document).on('click', "#overview_page", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "overview_page",
	}));
});

// Transactions
$(document).on('click', "#transactions_page", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "transactions_page",
	}));
});

$(document).on('click', "#view_all_transactions", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "transactions_page",
	}));
});

$(document).on('click', "#view_all_transactions_society", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "society_transactions",
	}));
});

// Society
$(document).on('click', "#society_page", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "society_page",
	}));
});

// Society transactions
$(document).on('click', "#society_transactions", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "society_transactions",
	}));
});

// Settings
$(document).on('click', "#settings_page", function() {
	$.post('https://okokBanking/action', JSON.stringify({
		action: "settings_page",
	}));
});

// End Pages

$(document).on('click', ".depositMoneyModal", function() {
	var modalId = $('#depositModal');
	var depositModal = new bootstrap.Modal(modalId);
	depositModal.show()
});

$(document).on('click', ".withdrawMoneyModal", function() {
	var modalId = $('#withdrawModal');
	var depositModal = new bootstrap.Modal(modalId);
	depositModal.show()
});

$(document).on('click', ".transferMoneyModal", function() {
	var modalId = $('#transferModal');
	var depositModal = new bootstrap.Modal(modalId);
	depositModal.show()
});

$(document).on('click', ".logout", function() {
	if(!isLoggingOut) {
		isLoggingOut = true
		logout_page()
	}
});

// Close ESC Key
$(document).ready(function() {
	document.onkeyup = function(data) {
		if (data.which === 27) {
			switch (selectedWindow) {
				case 'bankmenu':
					if(!isLoggingOut) {
						isLoggingOut = true
						logout_page()
					}
					break
				case 'societies':
					if(!isLoggingOut) {
						isLoggingOut = true
						logout_page()
					}
					break
				case 'settings':
					if(!isLoggingOut) {
						isLoggingOut = true
						logout_page()
					}
					break
				case 'atm':
					var popuprev_sound = new Audio('popupreverse.mp3');
					popuprev_sound.volume = 0.2;
					popuprev_sound.play();

					$(".atm_card").fadeOut();
					$.post('https://okokBanking/action', JSON.stringify({
						action: "close",
					}));
					selectedWindow = "none";

					break
			}
		}
	};
});

$(document).on('click', '#depositMoney', function() {
	var deposit_value = $('#deposit_value').val();

	$.post('https://okokBanking/action', JSON.stringify({
		action: 'deposit',
		value: deposit_value,
		window: selectedWindow,
	}));
	$('#deposit_value').val('');
	document.getElementById('depositMoney').disabled = true;
})

$(document).on('click', '#withdrawMoney', function() {
	var withdraw_value = $('#withdraw_value').val();

	$.post('https://okokBanking/action', JSON.stringify({
		action: 'withdraw',
		value: withdraw_value,
		window: selectedWindow,
	}));
	$('#withdraw_value').val('');
	document.getElementById('withdrawMoney').disabled = true;
})

$(document).on('click', "#transferMoney", function() {
	var transfer_value = $('#transfer_value').val();
	var iban_value = $('#transfer_iban').val();

	$.post('https://okokBanking/action', JSON.stringify({
		action: 'transfer',
		value: transfer_value,
		iban: iban_value,
		window: selectedWindow,
	}));
	$('#transfer_value').val('');
	$('#transfer_iban').val('');
	document.getElementById('transferMoney').disabled = true;
});

// Change iban
$(document).on('click', "#change_iban", function() {
	var new_iban = $('#new_iban').val();

	$.post('https://okokBanking/action', JSON.stringify({
		action: "change_iban",
		iban: new_iban,
	}));
	$('#new_iban').val('');
	document.getElementById('change_iban').disabled = true;
});

// Change pin
$(document).on('click', "#change_pin", function() {
	var new_pin = $('#new_pin').val();

	$.post('https://okokBanking/action', JSON.stringify({
		action: "change_pin",
		pin: new_pin,
	}));
	$('#new_pin').val('');
	document.getElementById('change_pin').disabled = true;
});

$(document).on('click', ".close-atm", function() {
	var popuprev_sound = new Audio('popupreverse.mp3');
	popuprev_sound.volume = 0.2;
	popuprev_sound.play();
	
	$('.atm_card').fadeOut();
	$.post('https://okokBanking/action', JSON.stringify({
		action: "close",
	}));
	selectedWindow = "none";
})

function checkIfEmpty() {
    // Deposit
    if (document.getElementById("deposit_value").value === "") {
        document.getElementById('depositMoney').disabled = true;
    } else { 
    document.getElementById('depositMoney').disabled = false;
    }

    // Withdraw
    if(document.getElementById("withdraw_value").value === "") {
        document.getElementById('withdrawMoney').disabled = true;
    } else { 
    document.getElementById('withdrawMoney').disabled = false;
    }

    // Transfer
    if(document.getElementById("transfer_value").value === "" || document.getElementById("transfer_iban").value === "") {
        document.getElementById('transferMoney').disabled = true;
    } else { 
    document.getElementById('transferMoney').disabled = false;
    }
}

function checkIfEmptySettings() {
     // New pin
    if(document.getElementById("new_pin").value === "") {
        document.getElementById('change_pin').disabled = true;
    } else { 
    document.getElementById('change_pin').disabled = false;
    }

    // New iban
    if(document.getElementById("new_iban").value === "") {
        document.getElementById('change_iban').disabled = true;
    } else { 
    document.getElementById('change_iban').disabled = false;
    }
}

function overview_page_function(event) {
  	for(var i=0; i<table.length; i++) {
		table[i].destroy();
		table.splice(i, 1);
	}

	$('#page-title').html('Overview');

	if (event.data.isInSociety){
		society = `<span class="sidebar-title mt-5">Society</span>
				   <p class="sidebar-item mt-2" id="society_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
				   <p class="sidebar-item" id="society_transactions" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>`;
	} else {
		society = '';
	}

	$('#sidebar').html(`
		<p class="sidebar-item mt-2 selected" id="overview_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
		<p class="sidebar-item" id="transactions_page" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>
		<p class="sidebar-item mt-2" id="settings_page" style="margin-bottom: 12px;"><i class="fas fa-cog"></i> <span class="ms-1">Settings</span></p>
		${society}
	`);

	$('#page_info').addClass('row');

	$('#page_info').html(`
		<div class="col-md-7" style="border-right: 1px solid rgba(62, 63, 75);">
			<div class="card text-center" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
				<div class="card-header" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
					<span style="color: #fff; font-size: 18px;"><i class="fas fa-chart-line"></i> Statistics</span>
				</div>
				<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
					<div>
						<canvas id="myChart" width="100%" height="45%" style="margin-top: 5px;"></canvas>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<div class="card h-100" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75); margin-top: 12px;">
						<div class="card-header text-center" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
							<span style="color: #fff; font-size: 18px;"><span><i class="fas fa-exchange-alt"></i> Last Transactions</span> <span class="badge bg-primary viewall-badge" style="position: absolute; font-size: 14px; right: 9px; top: 10px;" id="view_all_transactions"><i class="fas fa-eye"></i> VIEW ALL</span></span>
						</div>
						<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 0.6rem 1rem;">
							<table id="lastTransactionsTable">
								<tbody id="lastTransactionsData">
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											To <span style="color: #1f5eff;">Arthur James</span>
											<div style="margin-top: -5px;">Sent</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span> - 732 500 EUR</span> </td>
									</tr>
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											From <span style="color: #1f5eff;">Arthur James</span>
											<div style="margin-top: -5px;">Received</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71;">+ 12 750 EUR</span> </td>
									</tr>
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											From <span style="color: #1f5eff;">Bank Account</span>
											<div style="margin-top: -5px;">Withdrawn</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span>- 7 000 EUR</span> </td>
									</tr>
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											Into <span style="color: #1f5eff;">Bank Account</span>
											<div style="margin-top: -5px;">Deposited</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71;">+ 57 000 EUR</span> </td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-md-5">
			<div class="col-md-12">
				<div class="card" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
					<div class="card-header text-center" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
						<span style="color: #fff; font-size: 18px;"><i class="bi bi-credit-card-fill"></i> Informations</span>
					</div>
					<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 16px;">
						<div class="card creditcard-classic_card d-flex align-items-center" style="margin: 0 auto; margin-bottom: 16px;">
							<div class="card-body creditcard-classic_card-body">
								<span class="d-flex justify-content-between"><span><img src="visa_white.svg" style="width: 20%;"><span style="color: #fff; font-size: 12px; margin-left: 5px; font-weight: 500;">okokBank Classic</span></span><span><i class="fas fa-wifi"></i></span></span>
								<div style="margin-top: 38%;">
									<div class="d-flex align-items-center">
										<span style="font-weight: 500; color: #fff; line-height: 1;">Status</span>
									</div>
									<div class="d-flex justify-content-between align-items-center">
										<span style="color: #fff; font-size: 24px; color: #fff; line-height: 1; text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.5);">ACTIVE</span>
										<div class="d-flex align-items-center" style="width: 25px; line-height: 1; margin-right: 34px;">
											<span style="color: #fff; font-size: 8px; font-weight: 500; margin-right: 3px;">VALID THRU</span>
											<span style="color: #fff; font-weight: 500; font-size: 16px;">08/25</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<hr>
						<p class="card-text text-center" style="font-size: 20px;"><span style="color: #fff;">Balance:</span> <span id="playerBankMoney"></span> EUR</p>
						<p class="card-text text-center" style="font-size: 20px;"><span style="color: #fff;">IBAN:</span> <span id="playerIBAN">OK182716</span></p>
					</div>
				</div>
				<!--<br>
				<div class="card text-center" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
					<div class="card-header" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
						<span style="color: #fff; font-size: 18px;"><i class="bi bi-credit-card-fill"></i> Informations</span>
					</div>
					<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 16px;">
						<p class="card-text"><span style="color: #fff;">Balance:</span> 1.500.000€</p>
						<p class="card-text"><span style="color: #fff;">IBAN:</span> OK182716</p>
					</div>
				</div>-->
				<div class="card text-center h-100" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75); margin-top: 12px;">
					<div class="card-header" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
						<span style="color: #fff; font-size: 18px;"><i class="fas fa-list-ul"></i> Actions</span>
					</div>
					<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
						<div class="d-flex justify-content-center">
							<button type="button" id="depositMoneyModal" class="btn btn-blue flex-grow-1" style="border-radius: 10px; flex-basis: 100%;" data-bs-toggle="modal" data-bs-target="#depositModal"><i class="bi bi-upload"></i> Deposit</button>
						</div>
						<div class="d-flex justify-content-center" style="margin-top: 7px;">
							<button type="button" id="withdrawMoneyModal" class="btn btn-blue flex-grow-1" style="border-radius: 10px; flex-basis: 100%;" data-bs-toggle="modal" data-bs-target="#withdrawModal"><i class="bi bi-download"></i> Withdraw</button>
						</div>
						<div class="d-flex justify-content-center" style="margin-top: 7px;">
							<button type="button" id="transferMoneyModal" class="btn btn-blue flex-grow-1" style="border-radius: 10px; flex-basis: 100%;" data-bs-toggle="modal" data-bs-target="#transferModal"><i class="fas fa-exchange-alt"></i> Transfer</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`);

	$("#playerName").html(event.data.playerName);
	$("#playerBankMoney").html(event.data.playerBankMoney.toLocaleString());
	$("#playerIBAN").html(event.data.playerIBAN);
	$("#wallet_money").html(event.data.walletMoney.toLocaleString());

	var row = '';
	var num = event.data.db.length;

	if (num > 4) {
		num = 4
	}

	for(var i = 0; i < num; i++) {

		var db = event.data.db[i];

		// Received
		if (db.type === 'transfer' && db.receiver_identifier === event.data.identifier) {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
						<div style="margin-top: -5px;">Received</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
		// Sent
		} else if (db.type === 'transfer' && db.sender_identifier === event.data.identifier) {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						To <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
						<div style="margin-top: -5px;">Sent</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
		// Deposited
		} else if (db.type === 'deposit') {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						Into <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
						<div style="margin-top: -5px;">Deposited</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
		// Withdrawn
		} else if (db.type === 'withdraw') {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
						<div style="margin-top: -5px;">Withdrawn</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
		}

		row += `
			<tr>
				${icon}
				${data}
				${amount}
			</tr>
		`;
	}
	$('#lastTransactionsData').html(row);

	var table_id = document.getElementById('lastTransactionsTable');
	table.push(new simpleDatatables.DataTable(table_id, {
		searchable: false,
		perPageSelect: false,
		paging: false,
	}));

	const labels = [];

	const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

	for (i = 6; i > -1; i--) {
		var days = i; // Days you want to subtract
		var date = new Date();
		var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
		var day =last.getDate();
		var month=last.getMonth();

		labels.push(day+" "+months[month])
	}

	var ctx = document.getElementById('myChart').getContext('2d');
	var gradient = ctx.createLinearGradient(0, 0, 0, 300);

	gradient.addColorStop(0, 'rgba(20, 75, 217, 0.5)');
	gradient.addColorStop(1, 'rgba(25, 70, 189, 0)');

	const day_earnings = event.data.graphDays;

	var data_graph = {
		labels: labels,
		datasets: [{
			label: 'Earnings',
			backgroundColor: gradient,
			borderColor: '#1f5eff',
			data: [day_earnings[6], day_earnings[5], day_earnings[4], day_earnings[3], day_earnings[2], day_earnings[1], day_earnings[0]],
			tension: 0.25,
			fill: 'start',
			pointBackgroundColor: '#1f5eff',
			pointRadius: 4,
			pointHoverRadius: 6,
		}]
	};

	var config = {
		type: 'line',
		data: data_graph,
		options: {
			plugins: {
				legend: {
					display: false
				}
			},
			animation: {
		        duration: 0
		    },
			scales: {
				yAxes: {
			        grid: {
			        	lineWidth: 1,
			        	color: '#434552',
			        	drawBorder: false
			        }
			    },
		    	xAxes: {
		    		grid: {
			        	display: false
			        }
		      	},
		    }
		}
	};

	var myChart = new Chart (document.getElementById('myChart'), config);

	selectedWindow = "bankmenu";
}

function society_page_function(event) {
  	for(var i=0; i<table.length; i++) {
		table[i].destroy();
		table.splice(i, 1);
	}

	$('#page-title').html('Society ['+event.data.societyInfo.society_name+']');

	if (event.data.isInSociety){
		society = `<span class="sidebar-title mt-5">Society</span>
				   <p class="sidebar-item mt-2 selected" id="society_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
				   <p class="sidebar-item" id="society_transactions" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>`;
	} else {
		society = '';
	}

	$('#sidebar').html(`
		<p class="sidebar-item mt-2" id="overview_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
		<p class="sidebar-item" id="transactions_page" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>
		<p class="sidebar-item mt-2" id="settings_page" style="margin-bottom: 12px;"><i class="fas fa-cog"></i> <span class="ms-1">Settings</span></p>
		${society}
	`);

	$('#page_info').addClass('row');

	$('#page_info').html(`
		<div class="col-md-7" style="border-right: 1px solid rgba(62, 63, 75);">
			<div class="card text-center" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
				<div class="card-header" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
					<span style="color: #fff; font-size: 18px;"><i class="fas fa-chart-line"></i> Statistics</span>
				</div>
				<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
					<div>
						<canvas id="myChart" width="100%" height="45%" style="margin-top: 5px;"></canvas>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<div class="card h-100" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75); margin-top: 12px;">
						<div class="card-header text-center" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
							<span style="color: #fff; font-size: 18px;"><span><i class="fas fa-exchange-alt"></i> Last Transactions</span> <span class="badge bg-primary viewall-badge" style="position: absolute; font-size: 14px; right: 9px; top: 10px;" id="view_all_transactions_society"><i class="fas fa-eye"></i> VIEW ALL</span></span>
						</div>
						<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; padding: 0.6rem 1rem;">
							<table id="lastTransactionsTable">
								<tbody id="lastTransactionsData">
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											To <span style="color: #1f5eff;">Arthur James</span>
											<div style="margin-top: -5px;">Sent</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span> - 732 500 EUR</span> </td>
									</tr>
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											From <span style="color: #1f5eff;">Arthur James</span>
											<div style="margin-top: -5px;">Received</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71;">+ 12 750 EUR</span> </td>
									</tr>
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											From <span style="color: #1f5eff;">Bank Account</span>
											<div style="margin-top: -5px;">Withdrawn</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span>- 7 000 EUR</span> </td>
									</tr>
									<tr>
										<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>
										<td class="align-middle" style="font-weight: 500; font-size: 16px;">
											Into <span style="color: #1f5eff;">Bank Account</span>
											<div style="margin-top: -5px;">Deposited</div>
										</td>
										<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71;">+ 57 000 EUR</span> </td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-md-5">
			<div class="col-md-12">
				<div class="card" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
					<div class="card-header text-center" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
						<span style="color: #fff; font-size: 18px;"><i class="bi bi-credit-card-fill"></i> Informations</span>
					</div>
					<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 16px;">
						<div class="card creditcard-classic_card d-flex align-items-center" style="margin: 0 auto; margin-bottom: 16px;">
							<div class="card-body creditcard-classic_card-body">
								<span class="d-flex justify-content-between"><span><img src="visa_white.svg" style="width: 20%;"><span style="color: #fff; font-size: 12px; margin-left: 5px; font-weight: 500;">okokBank Society</span></span><span><i class="fas fa-wifi"></i></span></span>
								<div style="margin-top: 38%;">
									<div class="d-flex align-items-center">
										<span style="font-weight: 500; color: #fff; line-height: 1;">Status</span>
									</div>
									<div class="d-flex justify-content-between align-items-center">
										<span style="color: #fff; font-size: 24px; color: #fff; line-height: 1; text-shadow: 0px 0px 2px rgba(255, 255, 255, 0.5);">ACTIVE</span>
										<div class="d-flex align-items-center" style="width: 25px; line-height: 1; margin-right: 34px;">
											<span style="color: #fff; font-size: 8px; font-weight: 500; margin-right: 3px;">VALID THRU</span>
											<span style="color: #fff; font-weight: 500; font-size: 16px;">08/25</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<hr>
						<p class="card-text text-center" style="font-size: 20px;"><span style="color: #fff;">Balance:</span> <span id="playerBankMoney"></span> EUR</p>
						<p class="card-text text-center" style="font-size: 20px;"><span style="color: #fff;">IBAN:</span> <span id="playerIBAN">OK182716</span></p>
					</div>
				</div>
				<!--<br>
				<div class="card text-center" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
					<div class="card-header" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
						<span style="color: #fff; font-size: 18px;"><i class="bi bi-credit-card-fill"></i> Informations</span>
					</div>
					<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; font-size: 16px;">
						<p class="card-text"><span style="color: #fff;">Balance:</span> 1.500.000€</p>
						<p class="card-text"><span style="color: #fff;">IBAN:</span> OK182716</p>
					</div>
				</div>-->
				<div class="card text-center h-100" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75); margin-top: 12px;">
					<div class="card-header" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
						<span style="color: #fff; font-size: 18px;"><i class="fas fa-list-ul"></i> Actions</span>
					</div>
					<div class="card-body" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
						<div class="d-flex justify-content-center">
							<button type="button" id="depositMoneyModal" class="btn btn-blue flex-grow-1" style="border-radius: 10px; flex-basis: 100%;" data-bs-toggle="modal" data-bs-target="#depositModal"><i class="bi bi-upload"></i> Deposit</button>
						</div>
						<div class="d-flex justify-content-center" style="margin-top: 7px;">
							<button type="button" id="withdrawMoneyModal" class="btn btn-blue flex-grow-1" style="border-radius: 10px; flex-basis: 100%;" data-bs-toggle="modal" data-bs-target="#withdrawModal"><i class="bi bi-download"></i> Withdraw</button>
						</div>
						<div class="d-flex justify-content-center" style="margin-top: 7px;">
							<button type="button" id="transferMoneyModal" class="btn btn-blue flex-grow-1" style="border-radius: 10px; flex-basis: 100%;" data-bs-toggle="modal" data-bs-target="#transferModal"><i class="fas fa-exchange-alt"></i> Transfer</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`);

	$("#playerBankMoney").html(event.data.societyInfo.value.toLocaleString());
	$("#wallet_money").html(event.data.walletMoney.toLocaleString());
	$("#playerIBAN").html(event.data.societyInfo.iban);

	var row = '';
	var num = event.data.db.length;

	if (num > 4) {
		num = 4
	}

	for(var i = 0; i < num; i++) {

		var db = event.data.db[i];

		// Received
		if (db.type === 'transfer' && db.receiver_identifier === event.data.societyInfo.society) {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
						<div style="margin-top: -5px;">Received</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
		// Sent
		} else if (db.type === 'transfer' && db.sender_identifier === event.data.societyInfo.society) {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						To <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
						<div style="margin-top: -5px;">Sent</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
		// Deposited
		} else if (db.type === 'deposit') {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-download"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						Into <span style="color: #1f5eff; font-weight: 600;">${db.receiver_name}</span>
						<div style="margin-top: -5px;">Deposited</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="color: #2ecc71; float: right;">+ ${db.value.toLocaleString()} EUR</span> </td>`;
		// Withdrawn
		} else if (db.type === 'withdraw') {
			icon = '<td class="align-middle"><span style="background-color: #1d1e24; padding: 5px 10px 5px 10px; border-radius: 10px;"><i class="bi bi-upload"></i></span></td>';
			data = `<td class="align-middle" style="font-weight: 500; font-size: 16px;">
						From <span style="color: #1f5eff; font-weight: 600;">${db.sender_name}</span>
						<div style="margin-top: -5px;">Withdrawn</div>
					</td>`;
			amount = `<td class="align-middle" style="font-weight: 500;"><span style="float: right;"> - ${db.value.toLocaleString()} EUR</span> </td>`;
		}

		row += `
			<tr>
				${icon}
				${data}
				${amount}
			</tr>
		`;
	}
	$('#lastTransactionsData').html(row);

	var table_id = document.getElementById('lastTransactionsTable');
	table.push(new simpleDatatables.DataTable(table_id, {
		searchable: false,
		perPageSelect: false,
		paging: false,
	}));

	const labels = [];

	const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
	
	for (i = 6; i > -1; i--) {
		var days = i; // Days you want to subtract
		var date = new Date();
		var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
		var day =last.getDate();
		var month=last.getMonth();

		labels.push(day+" "+months[month])
	}

	var ctx = document.getElementById('myChart').getContext('2d');
	var gradient = ctx.createLinearGradient(0, 0, 0, 300);

    gradient.addColorStop(0, 'rgba(20, 75, 217, 0.5)');
    gradient.addColorStop(1, 'rgba(25, 70, 189, 0)');

    const day_earnings = event.data.graphDays;

	var data_graph = {
		labels: labels,
		datasets: [{
			label: 'Earnings',
			backgroundColor: gradient,
			borderColor: '#1f5eff',
			data: [day_earnings[6], day_earnings[5], day_earnings[4], day_earnings[3], day_earnings[2], day_earnings[1], day_earnings[0]],
			tension: 0.25,
			fill: 'start',
			pointBackgroundColor: '#1f5eff',
			pointRadius: 4,
			pointHoverRadius: 6,
		}]
	};

	var config = {
		type: 'line',
		data: data_graph,
		options: {
			plugins: {
				legend: {
					display: false
				}
			},
			animation: {
		        duration: 0
		    },
			scales: {
				yAxes: {
			        grid: {
			        	lineWidth: 1,
			        	color: '#434552',
			        	drawBorder: false
			        }
			    },
		    	xAxes: {
		    		grid: {
			        	display: false
			        }
		      	},
		    }
		}
	};
	
	var myChart = new Chart (document.getElementById('myChart'), config);

	selectedWindow = "societies";
}

function settings_page_function(event) {
	for(var i=0; i<table.length; i++) {
		table[i].destroy();
		table.splice(i, 1);
	}

	$('#page-title').html('Settings');

	if (event.data.isInSociety){
		society = `<span class="sidebar-title mt-5">Society</span>
				   <p class="sidebar-item mt-2" id="society_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
				   <p class="sidebar-item" id="society_transactions" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>`;
	} else {
		society = '';
	}

	$('#sidebar').html(`
		<p class="sidebar-item mt-2" id="overview_page" style="margin-bottom: 12px;"><i class="bi bi-grid-1x2-fill"></i> <span class="ms-1">Overview</span></p>
		<p class="sidebar-item" id="transactions_page" style="margin-bottom: 12px;"><i class="fas fa-exchange-alt"></i> <span class="ms-1">Transactions</span></p>
		<p class="sidebar-item mt-2 selected" id="settings_page" style="margin-bottom: 12px;"><i class="fas fa-cog"></i> <span class="ms-1">Settings</span></p>
		${society}
	`);

	$('#page_info').addClass('row');

	$('#page_info').html(`
		<div class="col-md-12 d-flex flex-grow-1 flex-column h-100" style="flex: 1 1 50%;">
			<div class="card d-flex flex-column flex-grow-1" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75);">
				<div class="card-header text-center" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
					<span style="color: #fff; font-size: 18px;">
						<span><i class="fas fa-address-card"></i> Account IBAN</span>
					</span>
				</div>
				<div class="card-body flex-grow-1" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
					<div class="">
						<div class="row">
							<div class="col col-md-6 d-flex justify-content-center">
								<div class="card w-100 h-100" style="background-color: #292a31; border-radius: 10px; color: #fff;">
								  <div class="card-body text-center">
								    <span style="font-size: 24px; color: #fff;">Change IBAN</span>
									<input type="text" maxlength="${event.data.ibanCharNum}" id="new_iban" class="form-control text-center" placeholder="New IBAN" onkeyup="checkIfEmptySettings()" style="margin-top: 12px; width: 100%;">
									<button type="button" id="change_iban" class="btn btn-blue" style="border-radius: 10px; flex-basis: 100%; margin-top: 12px; width: 100%;" disabled><i class="fas fa-paper-plane"></i> Submit</button>
								  </div>
								</div>
							</div>
							<div class="col col-md-6 d-flex align-items-center">
								<div class="card w-100 h-100 d-flex justify-content-center" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
								  <div class="card-body text-center" style="font-size: 18px;">
								    <span>The IBAN has a change cost of ${event.data.ibanCost}€</span>
								    <hr style="color: #fff;">
								    <span>The IBAN always have the prefix "${event.data.ibanPrefix}"</span>
								    <hr style="color: #fff;">
									<span>The maximum number of characters is ${event.data.ibanCharNum}</span>
								  </div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="card d-flex flex-column flex-grow-1" style="background-color: transparent; border-radius: 10px; box-shadow: 0px 0px 5 0px rgba(0, 0, 0, 0.75); margin-top: 12px;">
				<div class="card-header text-center" style="background-color: #292a31; border-top-right-radius: 10px; border-top-left-radius: 10px;">
					<span style="color: #fff; font-size: 18px;">
						<span><i class="fas fa-key"></i> PIN Code</span>
					</span>
				</div>
				<div class="card-body flex-grow-1" style="background-color: #1d1e24; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
					<div class="">
						<div class="row">
							<div class="col col-md-6 d-flex justify-content-center">
								<div class="card w-100 h-100" style="background-color: #292a31; border-radius: 10px; color: #fff;">
								  <div class="card-body text-center">
								    <span style="font-size: 24px; color: #fff;">Change PIN</span>
									<input type="password" maxlength="4" id="new_pin" class="form-control text-center" placeholder="New PIN" onkeyup="checkIfEmptySettings()" style="margin-top: 12px; width: 100%;">
									<button type="button" id="change_pin" class="btn btn-blue" style="border-radius: 10px; flex-basis: 100%; margin-top: 12px; width: 100%;" disabled><i class="fas fa-paper-plane"></i> Submit</button>
								  </div>
								</div>
							</div>
							<div class="col col-md-6 d-flex align-items-center">
								<div class="card w-100 h-100 d-flex justify-content-center" style="background-color: #1f5eff; border-radius: 10px; color: #fff;">
								  <div class="card-body text-center" style="font-size: 18px;">
								    <span>The PIN has a change cost of ${event.data.pinCost}€</span>
								    <hr style="color: #fff;">
									<span>The maximum number of characters is ${event.data.pinCharNum}</span>
									<hr style="color: #fff;">
									<span>You can only use numbers</span>
								  </div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`);

	selectedWindow = "settings";
}

function logout_page() {
	$("#menu").fadeOut();
	setTimeout(function () {
		$('#menu').html(`
			<div class="d-flex justify-content-center flex-column align-items-center">
				<span class="load"></span>
				<br>
				<div style="font-size: 40px; color: #fff;">Logging out...</div>
			</div>
		`);
		$("#menu").fadeIn();

		setTimeout(function(){
			var popuprev_sound = new Audio('popupreverse.mp3');
			popuprev_sound.volume = 0.2;
			popuprev_sound.play();
			
			$("#menu").fadeOut();
			$(".main_card").fadeOut();

			selectedWindow = "none";
			setTimeout(function(){
				isLoggingOut = false
				for(var i=0; i<table.length; i++) {
					table[i].destroy();
					table.splice(i, 1);
				}
			}, 600);
			$.post('https://okokBanking/action', JSON.stringify({
				action: "close",
			}));
		}, 1000);
	}, 400);
}

var canSetClick = true;

function atm_numpad(pin) {
	var input = "";
	correct = pin;

	var dots = document.querySelectorAll(".dot");
	numbers = document.querySelectorAll(".number");
	dots = Array.prototype.slice.call(dots);
	numbers = Array.prototype.slice.call(numbers);
	

	numbers.forEach(function (number, index) {
		if (canSetClick){
			number.addEventListener("click", numpad);
		}
		function numpad() {
			if (index === 9 || index === 11) {
				if (index === 9) {
					dots.forEach(function (dot, index) {
							dot.className = "dot clear";
						});
				} else if (index === 11) {
					if (input === correct) {
						var correct_sound = new Audio('correct.mp3');
						correct_sound.volume = 0.2;
						correct_sound.play();

						dots.forEach(function (dot, index) {
							dot.className = "dot active correct";
						});

						setTimeout(function () {
							var popuprev_sound = new Audio('popupreverse.mp3');
							popuprev_sound.volume = 0.2;
							popuprev_sound.play();

							$(".atm_card").fadeOut();
							$.post('https://okokBanking/action', JSON.stringify({
								action: "close",
							}));
							selectedWindow = "none";

							$.post('https://okokBanking/action', JSON.stringify({
								action: "atm",
							}));
						}, 900);
					} else {
						var wrong_sound = new Audio('wrong.mp3');
						wrong_sound.volume = 0.2;
						wrong_sound.play();

						dots.forEach(function (dot, index) {
							dot.className = "dot active wrong";
						});
					}
				}
				setTimeout(function () {
					dots.forEach(function (dot, index) {
						dot.className = "dot";
					});
					input = "";
				}, 900);
				setTimeout(function () {
					document.body.className = "";
				}, 2000);
			} else {
				var atm_sound = new Audio('atm.mp3');
				atm_sound.volume = 0.2;
				atm_sound.play();

				if (input.length < 4) {
					if (index === 10) {
					index = -1
				}
				number.className = "number grow";
				input += index + 1;
				dots[input.length - 1].className = "dot active";
				setTimeout(function () {
					number.className = "number";
				}, 1000);
				}
			}
		}
	});
	canSetClick = false
}