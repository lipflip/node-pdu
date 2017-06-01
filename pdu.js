'use strict';

var util    = require('util'),
    path    = require('path'),
    sprintf = require('sprintf');

function PDU()
{
    /**
     * Service Centre Address
     * @var SCA
     */
    this._sca;
    
    /**
     * Transport Protocol Data Unit
     * @var Type
     */
    this._type;
    
    /**
     * Originator or Destination Address
     * @var SCA
     */
    this._address;
    
    /**
     * Protoсol Identifier
     * @var PID
     */
    this._pid;
    
    /**
     * Data Coding Scheme
     * @var DCS
     */
    this._dcs;
    
    /**
     * User Data Length
     * @var integer
     */
    this._udl;
    
    /**
     * User Data
     * @var string
     */
    this._ud;
    
    this.setSca();
    this.initType();
    this.setPid();
    this.setDcs();
    
};

PDU.getHelper = function()
{
    return PDU.getModule('PDU/Helper');
}

PDU.getModule = function(name)
{
    return require(path.join(__dirname, name));
};

PDU.Submit  = function()
{
    return new (this.getModule('Submit'))();
};

PDU.Report  = function()
{
    return new (this.getModule('Report'))();
};

PDU.Deliver = function()
{
    return new (this.getModule('Deliver'))();
};

/**
 * parsed string
 * @var string
 */
PDU._pduParse = '';

/**
 * get a part pdu string and cut them from pdu
 * @param integer length
 * @return string
 */
PDU.getPduSubstr = function(length)
{
    var str = PDU._pduParse.substr(0, length);
    PDU._pduParse = PDU._pduParse.substr(length);
    return str;
};

/**
 * parse pdu string
 * @param string str
 * @return PDU
 * @throws Error
 */
PDU.parse = function(str)
{
    var SCA     = PDU.getModule('PDU/SCA'),
        DCS     = PDU.getModule('PDU/DCS'),
        Helper  = PDU.getModule('PDU/Helper');
    
    // current pdu string
    PDU._pduParse = str;

    // parse service center address
    var sca = SCA.parse(false);
        
    // parse type of sms
    var self = Helper.getPduByType();
    
    // set sca
    self._sca = sca;
        
    // parse sms address
    self._address = SCA.parse();
    
    return Helper.initVars(self);
};

/**
 * getter for udl
 * @return integer
 */
PDU.prototype.getUdl = function()
{
    return this._udl;
};

/**
 * setter for user data length
 * @param integer udl
 */
PDU.prototype.setUdl = function(udl)
{
    this._udl = udl;
};

/**
 * set sms center
 * @param string|null|SCA address
 * @return PDU
 */
PDU.prototype.setSca = function(address)
{
    var SCA = PDU.getModule('PDU/SCA');
    
    if(address instanceof SCA){
        this._sca = address;
        return this;
    }

    if( ! this._sca){
        this._sca = new SCA(false);
    }

    if(address){
        this._sca.setPhone(address, true);
    }

    return this;
};

/**
 * getter for SCA
 * @return SCA
 */
PDU.prototype.getSca = function()
{
    return this._sca;
};

/**
 * get pdu type
 * @return PDU\Type
 */
PDU.prototype.getType = function()
{
    return this._type;
};

/**
 * setter for the type of pdu
 * @param PDU\Type $type
 */
PDU.prototype.setType = function(type)
{
    this._type = type;
};

/**
 * set address
 * @param string|PDU\SCA $address
 * @return PDU
 */
PDU.prototype.setAddress = function(address)
{
    var SCA = PDU.getModule('PDU/SCA');
    
    if(address instanceof SCA){
        this._address = address;
        return this;
    }
    
    this._address = new SCA();
    this._address.setPhone(address);
    return this;
};

/**
 * getter address
 * @return PDU\SCA
 */
PDU.prototype.getAddress = function()
{
    return this._address;
};

/**
 * set Data Coding Scheme
 * @param PDU\DCS $dcs
 * @return PDU
 */
PDU.prototype.setDcs = function(dcs)
{
    var DCS = PDU.getModule('PDU/DCS');
    this._dcs = dcs || new DCS();
    return this;
};

/**
 * getter for dcs
 * @return PDU\DCS
 */
PDU.prototype.getDcs = function()
{
    return this._dcs;
};

/**
 * set data
 * @param string|PDU\Data $data
 * @return PDU
 */
PDU.prototype.setData = function(data)
{
    var Data = PDU.getModule('PDU/Data');
    
    if(data instanceof Data){
        this._ud = data;
    } else {
        this._ud = new Data(this);
        this._ud.setData(data);
    }
    
    return this;
};

/**
 * getter user data
 * @return PDU\Data
 */
PDU.prototype.getData = function()
{
    return this._ud;
};

/**
 * set pid
 * @param integer $pid
 * @return PDU
 */
PDU.prototype.setPid = function(pid)
{
    var PID = PDU.getModule('PDU/PID');
    this._pid = pid || new PID();
    return this;
};

/**
 * get pid
 * @return PID
 */
PDU.prototype.getPid = function()
{
    return this._pid;
};

/**
 * get parts sms
 * @return array
 */
PDU.prototype.getParts = function()
{
    if( ! this.getAddress()){
        throw new Error("Address not set");
    }

    if( ! this.getData()){
        throw new Error("Data not set");
    }

    return this.getData().getParts();
};

PDU.debug = function(message)
{
    if( ! PDU.isDebug){
        return;
    }
    
    var dt    = new Date(),
        dtime = sprintf(
            "%04d-%02d-%02dT%02d:%02d:%02d.%03d",
            dt.getFullYear(),
            dt.getMonth() + 1,
            dt.getDate(),
            dt.getHours(),
            dt.getMinutes(),
            dt.getSeconds(),
            dt.getMilliseconds()
        );
    console.info("# %s - %s", dtime, message);
};

module.exports = PDU;

