const fetch = require('node-fetch')
const {JSDOM} = require('jsdom')
const got = require('got')
const { map, forEach, sortBy } = require('lodash')

const sites = [
  {
    url: 'https://clevelandwoodleypark.helpfulvillage.com/events/index_list',
    scrapeProps: {
      name: {
        selector: `[itemtype="http://schema.org/Event"] [itemprop="name"]`,
      },
      url: {
        selector: `[itemtype="http://schema.org/Event"] [itemprop="url"]`,
        attribute: 'content',
      },
      startDate: {
        selector: `[itemtype="http://schema.org/Event"] [itemprop="startDate"]`,
        attribute: 'content',
      },
      organizerName: {
        selector: `[itemtype="http://schema.org/Organization"] [itemprop="name"]`,
        attribute: 'content',
      },
      organizerUrl: {
        selector: `[itemtype="http://schema.org/Organization"] [itemprop="url"]`,
        attribute: 'content',
      }
    }
  },
  {
    url: 'https://mountpleasant.helpfulvillage.com/events/index_list',
    scrapeProps: {
      name: {
        selector: `[itemtype="http://schema.org/Event"] [itemprop="name"]`,
      },
      url: {
        selector: `[itemtype="http://schema.org/Event"] [itemprop="url"]`,
        attribute: 'content',
      },
      startDate: {
        selector: `[itemtype="http://schema.org/Event"] [itemprop="startDate"]`,
        attribute: 'content',
      },
      organizerName: {
        selector: `[itemtype="http://schema.org/Organization"] [itemprop="name"]`,
        attribute: 'content',
      },
      organizerUrl: {
        selector: `[itemtype="http://schema.org/Organization"] [itemprop="url"]`,
        attribute: 'content',
      }
    }
  },
]


async function main() {
  let events = []
  const promises = sites.map((site) => (
    getSiteEvents(site)
  ))
  // Get the helpful village ones
  events = events.concat(...await Promise.all(promises))
  
  // Get the Splashthat ones
  events = events.concat(await getSplashthatEvents())

  events = sortBy(events, (event) => (
    new Date(event.startDate)
  ))
  console.log(events)
}

main()

async function getSplashthatEvents() {
  const response = await fetch('https://daclvirtualevents.splashthat.com/?action=ohmyhub&method=getItems&format=json&splash_hub_id=167567&splash_feed_id=2971111352&options%5Bfilter_date%5D=upcoming%2Congoing%2Ctbd%2Cpast&options%5Bdeep%5D=0', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0'
    },
  })
  if (!response.ok) throw new Error('Something failed with splashthat')
  const json = await response.json()
  return map(json.result, (event) => {
    if (!event.tags.includes('fitness') || event.event_status === 'past') return
    return {
      name: event.title,
      description: event.description,
      url: event.domain,
      startDate: event.date.start_timestamp,
      organizerName: event.venue.name,
      organizerUrl: null,
    }
  }).filter(Boolean)
}

async function getSiteEvents(site) {
  const results = await got(site.url)
  const siteEvents = []
  const dom = new JSDOM(results.body)
  
  const eventNodes = dom.window.document.querySelectorAll(`[id="list-card"]`)
  
  eventNodes.forEach((item) => {
    const newEvent = {}
    forEach(site.scrapeProps, (prop, key) => {
      const ele = item.querySelector(prop.selector)
      if (!ele) return
      if (prop.attribute) {
        newEvent[key] = ele.getAttribute(prop.attribute)
      } else {
        newEvent[key] = ele.textContent.trim()
      }
    })
    siteEvents.push(newEvent)
  })
  return siteEvents
}

