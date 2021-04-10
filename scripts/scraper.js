const fetch = require('node-fetch')
const {JSDOM} = require('jsdom')
const got = require('got')
const { map, forEach } = require('lodash')

async function main() {
  const results = await got('https://clevelandwoodleypark.helpfulvillage.com/events/index_list')
  const dom = new JSDOM(results.body)
  
  const events = []
  const eventNodes = dom.window.document.querySelectorAll(`[id="list-card"]`)
  const eventSchema = {
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
  eventNodes.forEach((item) => {
    const newEvent = {}
    forEach(eventSchema, (prop, key) => {
      const ele = item.querySelector(prop.selector)
      if (!ele) return
      if (prop.attribute) {
        newEvent[key] = ele.getAttribute(prop.attribute)
      } else {
        newEvent[key] = ele.textContent.trim()
      }
    })
    events.push(newEvent)
  })

  console.log(events)
}

main()
