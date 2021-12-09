import { Controller,Body,Post,Get } from '@nestjs/common';
import { TradingService } from './trading.service';
import { ConfigService } from '@nestjs/config';
import {HttpsProxyAgent} from 'hpagent';
import got from 'got';
const {binanceConnector}  = require('../../binance-connector/index')
// const {BinanceSpot} = require('@binance/connector2')

@Controller('trader/ticker')
export class TradingController {
    
    constructor(
        private readonly tradingService:TradingService,
        private configService: ConfigService,
    ){

    }

    @Post('find')
    //http://localhost:1788/trader/ticker/ticker/find
    findOne(@Body() body:any){
        return this.tradingService.findOne(body.username);
    }

    @Post('login')
    //http://localhost:1788/trader/ticker/ticker/login
    async login(@Body() body:any){
        let testUrl ='http://localhost:8089/trader/user/login'
        const {data} = await got.post(testUrl, {
         json: {
             "account":"abchen",
             "password":"123456"
         }
         }).json();
        return { code: 200, message: '登录成功',data};
    }

    @Get('24hr')
    ticker(){
       //test:
       //http://localhost:1788/trader/ticker/24hr?symbol=BTC-USDT&platform=okex
       const ticker24URL = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'
       const data= this.gotData(ticker24URL)
       return data
    }

    async gotData(ticker24URL:string){
        const data = await got.get(ticker24URL,{
            agent: {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 10000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    proxy: 'http://127.0.0.1:7890'
                })
            }
        }).json();
        return data
    }
    @Get('gensignature2')
    async generateSignature2(payload={}){
        const binance_api_secret= this.configService.get<string>('BINANCE_API_SECRET')
        const binance_api_key= this.configService.get<string>('BINANCE_API_KEY')
        const proxy_url= this.configService.get<string>('PROXY_URL')
        console.log("开始获取---->A",binance_api_secret)
        console.log("开始获取---->B",binance_api_key)
        console.log("开始获取---->C",proxy_url)
        /*
        const client = new BinanceSpot(binance_api_key, binance_api_secret)
       const data = await client.account()
       return { code: 200, message: '查询成功',data};
        */
    }

    //http://localhost:1788/trader/ticker/account/info
    @Get('account/info')
    async accountInfo(payload={}){
        const binance_api_secret= this.configService.get<string>('BINANCE_API_SECRET')
        const binance_api_key= this.configService.get<string>('BINANCE_API_KEY')
        const proxy_url= this.configService.get<string>('PROXY_URL')
        console.log("开始获取---->A",binance_api_secret)
        console.log("开始获取---->B",binance_api_key)
        console.log("开始获取---->C",proxy_url)
        // const client = new binanceConnector(binance_api_key, binance_api_secret,{},proxy_url)
        const client = new binanceConnector(binance_api_key, binance_api_secret,proxy_url,{})
        // Get account information
        // /*
        // client.account().then(response =>{
        //     console.log("response.data",response)
        // })
        // */
       const data = await client.account()
       return { code: 200, message: '查询成功',data};
    //    return { code: 200, message: '查询成功'};
    }

    //所属：现货账户和交易接口----账户成交历史
    @Get('myTrades')
    async myTrades(payload={}){
        const binance_api_secret= this.configService.get<string>('BINANCE_API_SECRET')
        const binance_api_key= this.configService.get<string>('BINANCE_API_KEY')
        const proxy_url= this.configService.get<string>('PROXY_URL')
        const client = new binanceConnector(binance_api_key, binance_api_secret,proxy_url,{})
        /*
        名称	类型	是否必需	描述
        symbol	STRING	YES	
        orderId	LONG	NO	必须要和参数symbol一起使用.
        startTime	LONG	NO	
        endTime	LONG	NO	
        fromId	LONG	NO	起始Trade id。 默认获取最新交易。
        limit	INT	NO	默认 500; 最大 1000.
        recvWindow	LONG	NO	赋值不能超过 60000
        timestamp	LONG	YES
        注意:
        如果设定 fromId , 获取订单 >= fromId. 否则返回最近订单。
        */
        const options = {
            limit:20
        }
        /*
        myTrades (symbol, options = {}) {
            validateRequiredParameters({ symbol })
            console.log("myTrades:",symbol)
            return this.signRequest(
            'GET',
            '/api/v3/myTrades',
            Object.assign(options, {
                symbol: symbol.toUpperCase()
            })
            )
        }
        */
        const data = await client.myTrades('ETHUSDT',options)
        return { code: 200, message: '查询成功',data};
    //    return { code: 200, message: '查询成功'};
    }

    //所属：现货账户和交易接口----测试下单 (TRADE)
    @Post('myTrades2')
    async myTrades2(payload={}){
        const binance_api_secret= this.configService.get<string>('BINANCE_API_SECRET')
        const binance_api_key= this.configService.get<string>('BINANCE_API_KEY')
        const proxy_url= this.configService.get<string>('PROXY_URL')
        const client = new binanceConnector(binance_api_key, binance_api_secret,proxy_url,{})

        let symbol = 'ETHUSDT'
        let side = 'SELL'
        let type = 'MARKET'
        const options = {
            timeInForce:'GTC',
            limit:20,
            timestamp:Date.now(),
            price:4300,
            quantity:0.01,
        }

        const data = await client.newOrderTest(symbol,side,type,options)
        console.log("路由返回",data)
       /*
       {
        "symbol": "BTCUSDT", // 交易对
        "orderId": 28, // 系统的订单ID
        "orderListId": -1, // OCO订单ID，否则为 -1
        "clientOrderId": "6gCrw2kRUAF9CvJDGP16IP", // 客户自己设置的ID
        "transactTime": 1507725176595, // 交易的时间戳
        "price": "0.00000000", // 订单价格
        "origQty": "10.00000000", // 用户设置的原始订单数量
        "executedQty": "10.00000000", // 交易的订单数量
        "cummulativeQuoteQty": "10.00000000", // 累计交易的金额
        "status": "FILLED", // 订单状态
        "timeInForce": "GTC", // 订单的时效方式
        "type": "MARKET", // 订单类型， 比如市价单，现价单等
        "side": "SELL", // 订单方向，买还是卖
        "fills": [ // 订单中交易的信息
            {
            "price": "4000.00000000", // 交易的价格
            "qty": "1.00000000", // 交易的数量
            "commission": "4.00000000", // 手续费金额
            "commissionAsset": "USDT" // 手续费的币种
            }, 
        ]
      }
      */
        return { code: 200, message: '查询成功',data};
    }
}