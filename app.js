const express = require('express')
const instagramPrivateApi = require('instagram-private-api')
const bodyParser = require('body-parser');

const {IgApiClient, DirectThreadEntity} = instagramPrivateApi
const app = express()
app.use(bodyParser.json())


const port = 3000
const ig = new IgApiClient();
ig.state.generateDevice(process.env.username);
async function init(){
  await ig.simulate.preLoginFlow();
  await ig.account.login(process.env.username, process.env.password);
  process.nextTick(async () => await ig.simulate.postLoginFlow());
}


app.get('/direct-inbox', async (req, res)=>{
  try {
    res.send(await ig.feed.directInbox().items())
  } catch (error) {
    res.sendStatus(500).send({
      error
    })
  }
})

app.post('/direct-inbox/:threadId', async (req, res)=>{
  try {
    if(!req.body.text){
      throw new Error('No text')
    }
    const directFeed = ig.feed.directInbox()
    const records = await directFeed.records();
    
    const thread = records.find(record =>
      record.threadId === req.params.threadId
    )
    if(!thread){
      throw new Error('cannot find thread')
    }
    
    const message = await thread.broadcastText(req.body.text)
    res.send({...message})
  } catch (error) {
    res.sendStatus(500).send({
      error
    })
  }
})

app.get('/', (req, res) => {
  console.log("Welcome!!!");
})

app.listen(process.env.PORT || port, () => init())
