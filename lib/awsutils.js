const {DynamoDBClient, QueryCommand, UpdateItemCommand, ExecuteStatementCommand, ScanCommand, DeleteItemCommand} = require('@aws-sdk/client-dynamodb')

const AWS_ENABLED = (function () {
    switch (process.env.ENABLE_AWS?.toLowerCase()) {
        case 'true':
            return true
            break;
        case 'false':
            return false
            break;
        case undefined:
            return false
            break;
        default:
            throw new Error('the env property AWS_ENABLED must be either "TRUE" or "FALSE"')
            break;
    }
})()
 
const dbClient = AWS_ENABLED ? new DynamoDBClient({region: "us-east1"}) : undefined

/** @typedef {import('@aws-sdk/client-dynamodb').QueryCommandInput} QueryCommandInput  */
/** @typedef {import('@aws-sdk/client-dynamodb').UpdateItemCommandInput} UpdateItemCommandInput  */
/** @typedef {number|string|boolean|string[]|number[]} channelPropertyTypes */

/**
 * retrieve a user's data 
 * @param {number|string} id - twitch ID of the user
 */
function queryUserData(id) {
    /** @type {QueryCommandInput} */
    let params = {
        TableName: 'UserData',
        ExpressionAttributeValues: {
            ':id': {N: String(id)}
        },
        KeyConditionExpression: 'TwitchID = :id'
    }
    let command = new QueryCommand(params)
    return dbClient.send(command)
}
/**
 * retrieve user data using the username secondary index 
 * @param {string} username 
 */
function queryUserDataByUsername(username) {
    /** @type {QueryCommandInput} */
    let params = {
        TableName: 'UserData',
        IndexName: 'Username-index',
        ExpressionAttributeValues: {
            ':u': {S: username}
        },
        KeyConditionExpression: 'Username = :u'
    }
    let command = new QueryCommand(params)
    return dbClient.send(command)    
}

/**
 * retrieve global weebhunting data 
 */
function queryGlobalData() {
    /** @type {QueryCommandInput} */
    let params = {
        TableName: 'GlobalData',
        ExpressionAttributeValues: {
            ':n': {S : 'GlobalData'}
        },
        ExpressionAttributeNames: {
            '#N': 'Name'
        },
        KeyConditionExpression: '#N = :n'
    }
    let command = new QueryCommand(params)
    return dbClient.send(command)
}

/**
 * 
 * @param {number|string} id - twitch ID of the user
 * @param {string[]} actions - an array of update actions to perform on the item, in this format: 'WeebHunt.**** = WeebHunt.**** + ###'
 * @param {string} [updatedUsername] - the twitch username of the user. updates the database with the real username if it has been recently changed
 * @param {userCallback} callback - callback function to call on returned data
 */
function updateUserData(id, actions, updatedUsername = undefined) {
    /** @type {UpdateItemCommandInput} */
    let params = {
        TableName: 'UserData',
        Key: {
            TwitchID: {N: String(id)}
        },
        ExpressionAttributeValues: {}
    }
    params.UpdateExpression = 'SET '
    if (updatedUsername) {
        params.UpdateExpression += 'Username = :u,'
        params.ExpressionAttributeValues[':u'] = {S: updatedUsername.toLowerCase()}
    }
    let i = 0
    // detect numbers and replace them with placeholder variables, updating the ExpressionAttributeValues as it goes along.
    actions = actions.map(action => action.replace(/\d+/,(num) => {
        // when a number is detected, replace it with a placeholder key and update the ExpressionAttributeValues property
        let replacement = ':' + String(i)
        params.ExpressionAttributeValues[replacement] = {N: String(num)}
        i++
        return replacement
    }))

    params.UpdateExpression += actions.join(', ')

    let command = new UpdateItemCommand(params)
    return dbClient.send(command)
}

/**
 * Occasionally, users may change their username. Use this to update the database with their new name, provided their ID. throws a ConditionalCheckFailedException error if the user does not exist in the database
 * @param {string|number} id - the Twitch ID of the user to update
 * @param {string} username - the "true" username of the user, to update the database with
 */
function updateUsername(id, username) {
    /** @type {UpdateItemCommandInput} */
    id = String(id)
    let params = {
        TableName: 'UserData',
        Key: {
            TwitchID: {N: id}
        },
        ExpressionAttributeValues: {
            ':u': { S: username.toLowerCase()},
            ':id': { N: id }
        },
        UpdateExpression: 'SET Username = :u',
        // checks whether the item exists. if it doesn't, don't create a new item 
        ConditionExpression: 'TwitchID = :id'
    }
    let command = new UpdateItemCommand(params)
    return dbClient.send(command)
}
/**
 * 
 * @param {string[]} actions - an array of update actions to perform on the item, in this format: 'KilledWeebs = KilledWeebs + ###'
 */
function updateGlobalData(actions) {
    let params = {
        TableName: 'GlobalData',
        Key: {
            'Name': {S: 'GlobalData'}
        },
        ExpressionAttributeValues: {}
    }
    let i = 0
    actions = actions.map(action => action.replace(/\d+/,(num) => {
        let replacement = ':' + String(i)
        params.ExpressionAttributeValues[replacement] = {N: String(num)}
        i++
        return replacement
    }))
    params.UpdateExpression = 'SET ' + actions.join(', ')

    let command = new UpdateItemCommand(params)
    return dbClient.send(command)
}

/**
 * smol wrapper to use a PartiQL statement to update a table
 * @param {string} statement - The PartiQL statement to execute
 */
function PartiQLUpdate(statement) {
    return dbClient.send(new ExecuteStatementCommand({
        Statement: statement
    }))
}
/** types */
const pqlTypes = [
    /**
     * STRING
     * 
     * string representation: FeelsDankMan
     * PQL representation: 'FeelsDankMan'
     */
    {
        JStype: 'string',
        PQLType: 'S',
        // checks whether a 
        test: val => typeof val == 'string',
        JSValToPQLString: val => `'${val}'`,
        stringToJSVal: val => val
    },
    /**
     * NUMBER
     * 
     * string representation: 12345
     * PQL representation: 12345
     */
    {
        JStype: 'number',
        PQLType: 'N',
        test: val => typeof val == 'number',
        JSValToPQLString: val => `${val}`,
        stringToJSVal: val => String(val)
    },
    /**
     * BOOLEAN
     * 
     * string representation: true | false
     * PQL representation: true | false
     */
    {
        JStype: 'number',
        PQLType: 'N',
        test: val => typeof val == 'boolean',
        JSValToPQLString: val => `${val}`,
        stringToJSVal: val => String(val)
    }
    /**
     * STRING SET (TO DO)
     * 
     * string representation: ['a','b','c']
     * PQL representation: 'TRUE' | 'FALSE'
     */
    // {
    //     JStype: 'number',
    //     PQLType: 'N',
    //     test: val => val.every(e => typeof e == 'string'),
    //     JSValToPQLString: val => `${val}`,
    //     stringToJSVal: val => val
    // },
    /**
     * NUMBER SET (TO DO)
     * 
     * string representation: [1,2,3]
     * PQL representation: 'TRUE' | 'FALSE'
     */
    // {
    //     JStype: 'number',
    //     PQLType: 'N',
    //     test: val => val.every(e => typeof e == 'number'),
    //     JSValToPQLString: val => `${val}`,
    //     stringToJSVal: val => val
    // }
]
/**
 * turns the given Javascript value at a string compatible with the PartiQL language
 * @param {channelPropertyTypes} value the value to turn into a string, can be: Number, String, Number Set, String Set or Boolean
 * @returns {string} 
 */
function PartiQLStringify(value) {
    switch (typeof value) {
        case 'number':
            return String(value)
            break;
        case 'string':
            return `'${value}'`
            break;
        case 'boolean':
            return String(value)
            break;
        case 'object':
            if (Array.isArray(value)) {
                if (value.every(e => typeof e == 'string')) {
                    return `<<${value.map(v => `'${v}'`).join(',')}>>`
                } else if (value.every(e => typeof e == 'number')) {
                    return `<<${value.map(v => String(v)).join(',')}>>`
                } else {
                    throw new TypeError('invalid type')
                }

            } else throw new TypeError('invalid type')
        default:
            throw new TypeError('invalid type')
            break;
    }
}



// remove methods if not aws environment
if (AWS_ENABLED) {
    module.exports = {
        queryUserData, queryGlobalData, updateGlobalData, updateUserData, dbClient, updateUsername, queryUserDataByUsername, PartiQLUpdate, PartiQLStringify, pqlTypes
    }
}
module.exports.AWS_ENABLED = AWS_ENABLED
