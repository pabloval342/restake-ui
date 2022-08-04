import React from 'react';
import _ from 'lodash'
import { CheckCircle, XCircle, InfoCircle } from "react-bootstrap-icons";
import TooltipIcon from './TooltipIcon.js';
import Coingecko from '../assets/coingecko.png'

function NetworkChecks(props) {
  const { network, error, skipConnected } = props
  const baseAsset = network?.baseAsset
  const price = baseAsset?.prices?.coingecko

  function renderCheck({ title, failTitle, description, failDescription, state, successClass, failClass, identifier, icon }) {
    const className = state ? (successClass || 'success') : (failClass || 'warning')

    const content = (
      <div className="small">
        {icon ? icon : state ? (
          <CheckCircle className="me-2 mb-1" />
        ) : (
          failClass === 'danger' ? <XCircle className="me-2 mb-1" /> : <InfoCircle className="me-2 mb-1" />
        )}{state ? title : (failTitle || title)}
      </div>
    )

    return (
      <li key={identifier} className={`list-group-item list-group-item-${className}`}>
        <TooltipIcon
          icon={content}
          identifier={identifier}
          tooltip={state ? description : (failDescription || description)}
        />
      </li>
    )
  }

  const className = ['list-group', props.className].join(' ')

  const operatorCheck =  {
    title: <span><strong>{network.operatorCount}</strong> REStake operators</span>,
    failTitle: "No REStake operators",
    failDescription: "There are no operators for this network yet. You can stake and compound manually in the meantime."
  }
  if(!network.authzSupport && network.operatorCount > 0){
    operatorCheck.failTitle = operatorCheck.title,
    operatorCheck.failDescription = "Authz is disabled but there are operators ready when support is added."
  }
  
  const testedCheck =  {
    title: 'Tested with REStake',
    failTitle: 'Experimental support',
    failDescription: "This network was added to REStake automatically and has not been thoroughly tested yet.",
  }
  if(!network.authzSupport && network.operatorCount > 0){
    testedCheck.failTitle = testedCheck.title,
    testedCheck.failDescription = "Authz is disabled but all other features have been fully tested."
  }

  return (
    <ul className={className} style={props.style}>
      {([
        renderCheck({
          title: <strong>{`$${price && price.usd.toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 2 })}`}</strong>,
          failTitle: 'Unknown Price',
          state: price?.usd,
          identifier: 'price',
          icon: <img src={Coingecko} style={{width: '1em', height: '1em'}} className="me-2 mb-1" />,
          failClass: 'success',
        }),
        renderCheck({
          title: <strong>{`${Math.round(network.estimatedApr * 100).toLocaleString()}% APR`}</strong>,
          failTitle: 'Unknown APR',
          state: network.estimatedApr,
          identifier: 'apr',
        }),
        !skipConnected && renderCheck({
          title: 'API connected',
          failTitle: 'API offline',
          failDescription: error,
          state: network.connected && !error,
          failClass: 'danger',
          identifier: 'network'
        }),
        renderCheck({
          title: 'Authz support',
          failTitle: 'Authz unsupported',
          failDescription: "This network doesn't support Authz just yet. You can stake and compound manually, REStake will update automatically when support is added.",
          state: network.authzSupport,
          identifier: 'authz'
        }),
        renderCheck({
          ...operatorCheck,
          state: network.authzSupport && network.operatorCount > 0,
          identifier: 'operators'
        }),
        renderCheck({
          ...testedCheck,
          state: network.authzSupport && !network.experimental,
          identifier: 'experimental'
        }),
      ])}
    </ul>
  )
}

export default NetworkChecks;
