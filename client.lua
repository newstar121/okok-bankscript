QBCore = nil
local PlayerData = {}
local trans = {}
local societyTrans = {}
local societyIdent, societyDays
local didAction = false
local isBankOpened = false
local canAccessSociety = false
local society = ''
local societyInfo
local closestATM, atmPos

local playerName, playerBankMoney, playerIBAN, trsIdentifier, allDaysValues, walletMoney

Citizen.CreateThread(function()
	while QBCore == nil do
		TriggerEvent("QBCore:GetObject", function(obj) QBCore = obj end)
		Citizen.Wait(0)
    end
	while QBCore.Functions.GetPlayerData().job == nil do
		Citizen.Wait(10)
	end
	PlayerData = QBCore.Functions.GetPlayerData()
end)

Citizen.CreateThread(function()
	if Config.ShowBankBlips then
		Citizen.Wait(2000)
		for k,v in ipairs(Config.BankLocations)do
			local blip = AddBlipForCoord(v.x, v.y, v.z)
			SetBlipSprite (blip, v.blip)
			SetBlipDisplay(blip, 4)
			SetBlipScale  (blip, v.blipScale)
			SetBlipColour (blip, v.blipColor)
			SetBlipAsShortRange(blip, true)
			BeginTextCommandSetBlipName("STRING")
			AddTextComponentString(v.blipText)
			EndTextCommandSetBlipName(blip)
		end
	end
end)

function NearATM()
    local ped = GetPlayerPed(-1)
    local pos = GetEntityCoords(ped)
    
    for i = 1, #Config.ATM do
        local atm = GetClosestObjectOfType(pos.x, pos.y, pos.z, Config.ATMDistance + 5, Config.ATM[i].model, false, false, false)
        if DoesEntityExist(atm) then
        	if atm ~= closestATM then
        		closestATM = atm
	        	atmPos = GetEntityCoords(atm)
	        end
	        local dist = GetDistanceBetweenCoords(pos.x, pos.y, pos.z, atmPos.x, atmPos.y, atmPos.z, true)
	        
	        if dist <= Config.ATMDistance then
	            return true
	        elseif dist <= Config.ATMDistance + 5 then
	        	return "update"
	        end
	    end
    end
end

function NearBank()
    local pos = GetEntityCoords(GetPlayerPed(-1))

    for k, v in pairs(Config.BankLocations) do
        local dist = GetDistanceBetweenCoords(v.x, v.y, v.z, pos.x, pos.y, pos.z, true)

        if dist <= v.BankDistance then
            return true
        elseif dist <= v.BankDistance + 5 then
        	return "update"
        end
    end
end

Citizen.CreateThread(function()
	local inRange = false
	local shown = false

    while true do
    	inRange = false
        Citizen.Wait(0)
        if NearBank() and not isBankOpened and NearBank() ~= "update" then
            inRange = true

            if IsControlJustReleased(0, 38) then
                SetNuiFocus(true, true)
				SendNUIMessage({
					action = 'loading_data',
				})
				Citizen.Wait(500)
				openBank()
            end
        elseif NearBank() == "update" then
        	Citizen.Wait(300)
        else
        	Citizen.Wait(1000)
        end

        if inRange and not shown then
        	shown = true
        	if Config.okokTextUI then
        		exports['okokTextUI']:Open('[E] To access the bank', 'darkblue', 'left')
            else
        		TriggerEvent('QBCore:Notify', "Press E to access the Bank", "success")
        	end
        elseif not inRange and shown then
        	shown = false
        	if Config.okokTextUI then
        		exports['okokTextUI']:Close()
        	end
        end
    end
end)

Citizen.CreateThread(function()
	local inRange = false
	local shown = false

    while true do
    	inRange = false
        Citizen.Wait(0)
        if NearATM() and not isBankOpened and NearATM() ~= "update" then
            inRange = true

            if IsControlJustReleased(0, 38) then
            	TriggerEvent("okokBanking:OpenATM")
            end
        elseif NearATM() == "update" then
        	Citizen.Wait(100)
        else
        	Citizen.Wait(1000)
        end

        if inRange and not shown then
        	shown = true
        	if Config.okokTextUI then
        		exports['okokTextUI']:Open('[E] To access the ATM', 'darkblue', 'left')
        	else
        		TriggerEvent('QBCore:Notify', "Press E to access the ATM", "success")
        	end
        elseif not inRange and shown then
        	shown = false
        	if Config.okokTextUI then
        		exports['okokTextUI']:Close()
        	end
        end
    end
end)

RegisterNetEvent("okokBanking:OpenATM")
AddEventHandler("okokBanking:OpenATM", function()
	local dict = 'anim@amb@prop_human_atm@interior@male@enter'
	local anim = 'enter'
	local ped = GetPlayerPed(-1)

	QBCore.Functions.TriggerCallback("okokBanking:GetPIN", function(pin)
		if pin then
			if not isBankOpened then
				isBankOpened = true
			    RequestAnimDict(dict)

			    while not HasAnimDictLoaded(dict) do
			        Citizen.Wait(7)
			    end

			    TaskPlayAnim(ped, dict, anim, 8.0, 8.0, -1, 0, 0, 0, 0, 0)
			    Citizen.Wait(Config.AnimTime)
			    ClearPedTasks(ped)
			    
	            SetNuiFocus(true, true)
				SendNUIMessage({
					action = 'atm',
					pin = pin,
				})
			end
		else
			exports['okokNotify']:Alert("BANK", "Head up to a bank to set a PIN code", 5000, 'info')
		end
	end)
end)

				

function openBank()
	local hasJob = false
	local playeJob = PlayerData.job
	local playerJobName = ''
	local playerJobGrade = ''
	local jobLabel = ''
	isBankOpened = true

	canAccessSociety = false

	if playeJob ~= nil then
		hasJob = true
		playerJobName = playeJob.name
		playerJobGrade = playeJob.grade.name
		jobLabel = playeJob.label
		society = 'society_'..playerJobName
	end

	QBCore.Functions.TriggerCallback("okokBanking:GetPlayerInfo", function(data)
		QBCore.Functions.TriggerCallback("okokBanking:GetOverviewTransactions", function(cb, identifier, allDays)
			for k,v in pairs(Config.Societies) do
				if playerJobName == v then
					if json.encode(Config.SocietyAccessRanks) ~= '[]' then
						for k2,v2 in pairs(Config.SocietyAccessRanks) do
							if playerJobGrade == v2 then
								canAccessSociety = true
							end
						end
					else
						canAccessSociety = true
					end
				end
			end

			if canAccessSociety then
				QBCore.Functions.TriggerCallback("okokBanking:SocietyInfo", function(cb)
					if cb ~= nil then
						societyInfo = cb
					else
						local societyIban = Config.IBANPrefix..jobLabel
						TriggerServerEvent("okokBanking:CreateSocietyAccount", society, jobLabel, 0, societyIban)
						Citizen.Wait(200)
						QBCore.Functions.TriggerCallback("okokBanking:SocietyInfo", function(cb)
							societyInfo = cb
						end, society)
					end
				end, society)
			end

			isBankOpened = true
			trans = cb
			playerName, playerBankMoney, playerIBAN, trsIdentifier, allDaysValues, walletMoney = data.playerName, data.playerBankMoney, data.playerIBAN, identifier, allDays, data.walletMoney
			QBCore.Functions.TriggerCallback("okokBanking:GetSocietyTransactions", function(societyTranscb, societyID, societyAllDays)
				societyIdent = societyID
				societyDays = societyAllDays
				societyTrans = societyTranscb

				if data.playerIBAN ~= nil then
					SetNuiFocus(true, true)
					SendNUIMessage({
						action = 'bankmenu',
						playerName = data.playerName,
						playerSex = data.sex,
						playerBankMoney = data.playerBankMoney,
						walletMoney = walletMoney,
						playerIBAN = data.playerIBAN,
						db = trans,
						identifier = trsIdentifier,
						graphDays = allDaysValues,
						isInSociety = canAccessSociety,
					})
				else
					GenerateIBAN()
					Citizen.Wait(1000)
					QBCore.Functions.TriggerCallback("okokBanking:GetPlayerInfo", function(data)
						SetNuiFocus(true, true)
						SendNUIMessage({
							action = 'bankmenu',
							playerName = data.playerName,
							playerSex = data.sex,
							playerBankMoney = data.playerBankMoney,
							walletMoney = walletMoney,
							playerIBAN = data.playerIBAN,
							db = trans,
							identifier = trsIdentifier,
							graphDays = allDaysValues,
							isInSociety = canAccessSociety,
						})
					end)
				end
			end, society)
		end)
	end)
end

RegisterNUICallback("action", function(data, cb)
	if data.action == "close" then
		isBankOpened = false
		SetNuiFocus(false, false)
	elseif data.action == "deposit" then
		if tonumber(data.value) ~= nil then
			if tonumber(data.value) > 0 then
				if data.window == 'bankmenu' then
					TriggerServerEvent('okokBanking:DepositMoney', tonumber(data.value))
				elseif data.window == 'societies' then
					TriggerServerEvent('okokBanking:DepositMoneyToSociety', tonumber(data.value), societyInfo.society, societyInfo.society_name)
				end
			else
				exports['okokNotify']:Alert("BANK", "Invalid amount", 5000, 'error')
			end
		else
			exports['okokNotify']:Alert("BANK", "Invalid input", 5000, 'error')
		end
	elseif data.action == "withdraw" then
		if tonumber(data.value) ~= nil then
			if tonumber(data.value) > 0 then
				if data.window == 'bankmenu' then
					TriggerServerEvent('okokBanking:WithdrawMoney', tonumber(data.value))
				elseif data.window == 'societies' then
					TriggerServerEvent('okokBanking:WithdrawMoneyToSociety', tonumber(data.value), societyInfo.society, societyInfo.society_name, societyInfo.value)
				end
			else
				exports['okokNotify']:Alert("BANK", "Invalid amount", 5000, 'error')
			end
		else
			exports['okokNotify']:Alert("BANK", "Invalid input", 5000, 'error')
		end
	elseif data.action == "transfer" then
		if tonumber(data.value) ~= nil then
			if tonumber(data.value) > 0 then
				QBCore.Functions.TriggerCallback("okokBanking:IsIBanUsed", function(isUsed, isPlayer, name)
					if isUsed ~= nil then
						if data.window == 'bankmenu' then
							if isPlayer then
								TriggerServerEvent('okokBanking:TransferMoney', tonumber(data.value), data.iban:upper(), isUsed.citizenid, isUsed.money, name)
							elseif not isPlayer then
								TriggerServerEvent('okokBanking:TransferMoneyToSociety', tonumber(data.value), isUsed.iban:upper(), isUsed.society_name, isUsed.society)
							end
						elseif data.window == 'societies' then
							local toMyself = false
							if data.iban:upper() == playerIBAN then
								toMyself = true
							end

							if isPlayer then
								TriggerServerEvent('okokBanking:TransferMoneyToPlayerFromSociety', tonumber(data.value), data.iban:upper(), isUsed.citizenid, isUsed.money, name, societyInfo.society, societyInfo.society_name, societyInfo.value, toMyself)
							elseif not isPlayer then
								TriggerServerEvent('okokBanking:TransferMoneyToSocietyFromSociety', tonumber(data.value), isUsed.iban:upper(), isUsed.society_name, isUsed.society, societyInfo.society, societyInfo.society_name, societyInfo.value)
							end
						end
					elseif isUsed == nil then
						exports['okokNotify']:Alert("BANK", "This IBAN does not exist", 5000, 'error')
					end
				end, data.iban:upper())
			else
				exports['okokNotify']:Alert("BANK", "Invalid amount", 5000, 'error')
			end
		else
			exports['okokNotify']:Alert("BANK", "Invalid input", 5000, 'error')
		end
	elseif data.action == "overview_page" then
		SetNuiFocus(true, true)
		SendNUIMessage({
			action = 'overview_page',
			playerBankMoney = playerBankMoney,
			walletMoney = walletMoney,
			playerIBAN = playerIBAN,
			db = trans,
			identifier = trsIdentifier,
			graphDays = allDaysValues,
			isInSociety = canAccessSociety,
		})
	elseif data.action == "transactions_page" then
		SetNuiFocus(true, true)
		SendNUIMessage({
			action = 'transactions_page',
			db = trans,
			identifier = trsIdentifier,
			graph_values = allDaysValues,
			isInSociety = canAccessSociety,
		})
	elseif data.action == "society_transactions" then
		SetNuiFocus(true, true)
		SendNUIMessage({
			action = 'society_transactions',
			db = societyTrans,
			identifier = societyIdent,
			graph_values = societyDays,
			isInSociety = canAccessSociety,
			societyInfo = societyInfo,
		})
	elseif data.action == "society_page" then
		SetNuiFocus(true, true)
		SendNUIMessage({
			action = 'society_page',
			playerBankMoney = playerBankMoney,
			walletMoney = walletMoney,
			playerIBAN = playerIBAN,
			db = societyTrans,
			identifier = societyIdent,
			graphDays = societyDays,
			isInSociety = canAccessSociety,
			societyInfo = societyInfo,
		})
	elseif data.action == "settings_page" then
		SetNuiFocus(true, true)
		SendNUIMessage({
			action = 'settings_page',
			isInSociety = canAccessSociety,
			ibanCost = Config.IBANChangeCost,
			ibanPrefix = Config.IBANPrefix,
			ibanCharNum = Config.CustomIBANMaxChars,
			pinCost = Config.PINChangeCost,
			pinCharNum = 4,
		})
	elseif data.action == "atm" then
		SetNuiFocus(true, true)
		SendNUIMessage({
			action = 'loading_data',
		})
		Citizen.Wait(500)
		openBank()
	elseif data.action == "change_iban" then
		if Config.CustomIBANAllowLetters then
			local iban = Config.IBANPrefix..data.iban:upper()
			
			QBCore.Functions.TriggerCallback("okokBanking:IsIBanUsed", function(isUsed, isPlayer)

				if isUsed == nil then
					TriggerServerEvent('okokBanking:UpdateIbanDB', iban, Config.IBANChangeCost)
				elseif isUsed ~= nil then
					exports['okokNotify']:Alert("BANK", "This IBAN is already in use", 5000, 'error')
				end
			end, iban)
		elseif not Config.CustomIBANAllowLetters then
			if tonumber(data.iban) ~= nil then
				local iban = Config.IBANPrefix..data.iban:upper()
				
				QBCore.Functions.TriggerCallback("okokBanking:IsIBanUsed", function(isUsed, isPlayer)

					if isUsed == nil then
						TriggerServerEvent('okokBanking:UpdateIbanDB', iban, Config.IBANChangeCost)
					elseif isUsed ~= nil then
						exports['okokNotify']:Alert("BANK", "This IBAN is already in use", 5000, 'error')
					end
				end, iban)
			else
				exports['okokNotify']:Alert("BANK", "You can only use numbers on your IBAN", 5000, 'error')
			end
		end
	elseif data.action == "change_pin" then
		if tonumber(data.pin) ~= nil then
			if string.len(data.pin) == 4 then
				QBCore.Functions.TriggerCallback("okokBanking:GetPIN", function(pin)
            		if pin then
            			TriggerServerEvent('okokBanking:UpdatePINDB', data.pin, Config.PINChangeCost)
            		else
            			TriggerServerEvent('okokBanking:UpdatePINDB', data.pin, 0)
					end
				end)
			else
				exports['okokNotify']:Alert("BANK", "Your PIN needs to be 4 digits long", 5000, 'info')
			end
		else
			exports['okokNotify']:Alert("BANK", "You can only use numbers", 5000, 'info')
		end
	end
end)

RegisterNetEvent("okokBanking:updateTransactions")
AddEventHandler("okokBanking:updateTransactions", function(money, wallet)
	Citizen.Wait(100)
	if isBankOpened then
		QBCore.Functions.TriggerCallback("okokBanking:GetOverviewTransactions", function(cb, id, allDays)
			trans = cb
			walletMoney = wallet
			playerBankMoney = money
			allDaysValues = allDays
			SetNuiFocus(true, true)
			SendNUIMessage({
				action = 'overview_page',
				playerBankMoney = playerBankMoney,
				walletMoney = walletMoney,
				playerIBAN = playerIBAN,
				db = trans,
				identifier = trsIdentifier,
				graphDays = allDaysValues,
				isInSociety = canAccessSociety,
			})
			TriggerEvent('okokBanking:updateMoney', money, wallet)
		end)
	end
end)

RegisterNetEvent("okokBanking:updateMoney")
AddEventHandler("okokBanking:updateMoney", function(money, wallet)
	if isBankOpened then
		playerBankMoney = money
		walletMoney = wallet
		SendNUIMessage({
			action = 'updatevalue',
			playerBankMoney = money,
			walletMoney = wallet,
		})
	end
end)

RegisterNetEvent("okokBanking:updateIban")
AddEventHandler("okokBanking:updateIban", function(iban)
	playerIBAN = iban
	SendNUIMessage({
		action = 'updateiban',
		iban = playerIBAN,
	})
end)

RegisterNetEvent("okokBanking:updateIbanPinChange")
AddEventHandler("okokBanking:updateIbanPinChange", function()
	Citizen.Wait(100)
	QBCore.Functions.TriggerCallback("okokBanking:GetOverviewTransactions", function(cbs, ids, allDays)
		trans = cbs
	end)
end)

RegisterNetEvent("okokBanking:updateTransactionsSociety")
AddEventHandler("okokBanking:updateTransactionsSociety", function(wallet)
	Citizen.Wait(100)
	QBCore.Functions.TriggerCallback("okokBanking:SocietyInfo", function(cb)
		QBCore.Functions.TriggerCallback("okokBanking:GetSocietyTransactions", function(societyTranscb, societyID, societyAllDays)
			QBCore.Functions.TriggerCallback("okokBanking:GetOverviewTransactions", function(cbs, ids, allDays)
				trans = cbs
				walletMoney = wallet
				societyDays = societyAllDays
				societyIdent = societyID
				societyTrans = societyTranscb
				societyInfo = cb
				if cb ~= nil then
					SetNuiFocus(true, true)
					SendNUIMessage({
						action = 'society_page',
						walletMoney = wallet,
						db = societyTrans,
						graphDays = societyDays,
						isInSociety = canAccessSociety,
						societyInfo = societyInfo,
					})
				else

				end
			end)
		end, society)
	end, society)
end)

function GenerateIBAN()
	math.randomseed(GetGameTimer())
	local stringFormat = "%0"..Config.IBANNumbers.."d"
	local number = math.random(0, 10^Config.IBANNumbers-1)
	number = string.format(stringFormat, number)
	local iban = Config.IBANPrefix..number:upper()
	local isIBanUsed = true
	local hasChecked = false

	while true do
		Citizen.Wait(10)
		if isIBanUsed and not hasChecked then
			isIBanUsed = false
			QBCore.Functions.TriggerCallback("okokBanking:IsIBanUsed", function(isUsed)
				if isUsed ~= nil then
					isIBanUsed = true
					number = math.random(0, 10^Config.IBANNumbers-1)
					number = string.format("%03d", number)
					iban = Config.IBANPrefix..number:upper()
				elseif isUsed == nil then
					hasChecked = true
					isIBanUsed = false
				end
				canLoop = true
			end, iban)
		elseif not isIBanUsed and hasChecked then
			break
		end
	end
	TriggerServerEvent('okokBanking:SetIBAN', iban)
end