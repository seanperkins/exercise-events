import Head from 'next/head'
import styles from '../styles/Home.module.css'

import events from './constants/events'

export default function Home() {
  return (
    <div className={styles.container}>
      <ul>

        {
          events.map(({name, description, startDate, url, organizerName, organizerUrl}, i) => (
            <li key={i}>
              <div>
                <span>{getLocalTime(startDate)}</span>
                <h2>{name}</h2>
                {description && <p>{description}</p>}
                <a href={url} target="_blank">{url}</a>
              </div>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

function getLocalTime(date) {
  const d = new Date(date)
  return d.toLocaleDateString()
}