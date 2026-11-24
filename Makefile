-include .env

deploy:
	forge create src/Escrow.sol:Escrow \
		--account hassanAccount \
		--rpc-url ${RPC_URL} \
		--broadcast \
		--value 0.01ether \
		--constructor-args \
		${BUYER} \
		${SELLER} \
		${ARBITER}

verify:
	forge verify-contract \
	0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D \
	src/Escrow.sol:Escrow \
	--chain sepolia \
	--etherscan-api-key ${ETHERSCAN_API_KEY} \
	--watch