
import { Token } from '../Main'
import { useEthers, useTokenBalance, useNotifications } from '@usedapp/core'
import { formatUnits } from '@ethersproject/units'
import { Button, CircularProgress, Input, Snackbar } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { useStakeTokens } from '../../hooks/useStakeTokens'
import { utils } from 'ethers'
import { Alert } from '@material-ui/lab'

interface StakeFormProps {
    token: Token
}

export const StakeForm = ({ token }: StakeFormProps) => {
    const { address: tokenAddress, name } = token
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
    }

    const { approveAndStake, state } = useStakeTokens(tokenAddress)

    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei.toString())
    }

    const { notifications } = useNotifications()

    const isMining = state.status === 'Mining'

    const [showERC20ApprovalSuccess, setShowERC20ApprovalSuccess] = useState(false)
    const [showTokenStakedSuccess, setShowTokenStakedSuccess] = useState(false)

    const handleCloseSnack = () => {
        setShowERC20ApprovalSuccess(false)
        setShowTokenStakedSuccess(false)
    }

    useEffect(() => {
        console.log(notifications)
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 Transfer").length > 0) {
            setShowERC20ApprovalSuccess(true)
        }
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Stake Tokens").length > 0) {
            setShowTokenStakedSuccess(true)
        }

    }, [notifications, showERC20ApprovalSuccess, showTokenStakedSuccess])
    return (
        <>
            <div>
                <Input onChange={handleInputChange} />
                <Button color="primary" size="large" onClick={handleStakeSubmit} disabled={isMining}>
                    {isMining ? <CircularProgress size={26} /> : "Stake"}
                </Button>
            </div>
            <Snackbar open={showERC20ApprovalSuccess} autoHideDuration={6000} onClose={handleCloseSnack}>
                <Alert severity="success" onClose={handleCloseSnack}>
                    ERC-20 Token transfer approved! Now approve the 2nd transaction.
                </Alert>
            </Snackbar>
            <Snackbar open={showTokenStakedSuccess} autoHideDuration={6000} onClose={handleCloseSnack}>
                <Alert severity="success" onClose={handleCloseSnack}>
                    Tokens Staked!
                </Alert>
            </Snackbar>
        </>
    )
}