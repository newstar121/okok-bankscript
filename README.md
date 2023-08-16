Hi, thank you for buying my script, I'm very grateful!

If you need help contact me on discord: okok#3488
Discord server: https://discord.gg/FauTgGRUku

1. First of all add the required tables to your database, executing the following code:

CREATE TABLE `okokBanking_transactions`	(
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`receiver_identifier` varchar(255) NOT NULL,
	`receiver_name` varchar(255) NOT NULL,
	`sender_identifier` varchar(255) NOT NULL,
	`sender_name` varchar(255) NOT NULL,
	`date` varchar(255) NOT NULL,
	`value` int(50) NOT NULL,
	`type` varchar(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `okokBanking_societies`	(
  `society` varchar(255) NULL DEFAULT NULL,
	`society_name` varchar(255) NULL DEFAULT NULL,
	`value` int(50) NULL DEFAULT NULL,
	`iban` varchar(255) NOT NULL,
	`is_withdrawing` int(1) NULL DEFAULT NULL
);

ALTER TABLE `players` ADD COLUMN `iban` varchar(255) NULL DEFAULT NULL;

ALTER TABLE `players` ADD COLUMN `pincode` int(50) NULL DEFAULT NULL;

2. To add salary/paycheck transactions navigate to 'qb-core/server' and open 'loops.lua'.

2.1. Replace all the code with the following:

PaycheckLoop = function()
	local Players = QBCore.Functions.GetPlayers()

	for i=1, #Players, 1 do
		local Player = QBCore.Functions.GetPlayer(Players[i])

		if Player.PlayerData.job ~= nil and Player.PlayerData.job.payment > 0 then
			Player.Functions.AddMoney('bank', Player.PlayerData.job.payment)
			TriggerClientEvent('QBCore:Notify', Players[i], "You received your paycheck of $"..Player.PlayerData.job.payment)
			TriggerEvent('okokBanking:AddTransferTransactionFromSocietyToP', Player.PlayerData.job.payment, "salary", "Salary", Player.PlayerData.citizenid, Player.PlayerData.charinfo.firstname..' '..Player.PlayerData.charinfo.lastname)
		end
	end
	SetTimeout(QBCore.Config.Money.PayCheckTimeOut * (60 * 1000), PaycheckLoop)
end

3. To replace the "okokBanking" logo, simply replace it with yours on the 'web' folder.