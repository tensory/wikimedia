#!/usr/bin/env php

<?php
/**
 * CurrencyConverter
 * @author Ari Lacenski
 */
class CurrencyConverter {
    // Database connection for CurrencyConverter
    private static $er;	

    public function __construct() {
        self::$er = new ExchangeRates();
    }

    /**
     * convert
     * Public API method that can handle
     * either an array of format "currency amount"
     * or one value in that format. 
     * 
     * @param {string|array} input 
     */
    public function convert($input) {
        if (empty($input)) {
            throw new InvalidArgumentException("Empty input");
        }

        if (is_array($input)) {
            $result = array();
            foreach ($input as $amount) {
                $result[] = $this->doConvert($amount);
            }
        } else {
            $result = $this->doConvert($input);
        }
        return $result;
    }    
    
    /**
     * doConvert
     * Protected class method that actually does the conversion
     * 
     * @param type $input
     * @return string 
     */
    protected function doConvert($input) {
        $pieces = explode(' ', $input);
        $convert['currency'] = $pieces[0];
        $convert['value'] = $pieces[1];
        
        if (!isset($convert['currency']) || !isset($convert['value'])) {
            return "Bad input: " . $input;
        }
        
        $target = 'USD'; // For now, target currency is always USD

        try {
            $rate = self::$er->getRate($convert['currency'], $target);
        } catch (Exception $e) {
            return $e->getMessage();
        }
		  $converted = $rate * $convert['value'];

        return sprintf('%s %d', $target, $converted);
    }
}

/**
 * Model for exchange_rates table. 
 * Requires PHP with SimpleXML module.
 * @author Ari Lacenski
 */
class ExchangeRates {
	protected $currency;
    protected $base;
    protected $rate;
    protected $db;
    const SOURCE_URL = 'http://toolserver.org/~kaldari/rates.xml';
    const TABLE = 'exchange_rates';
    
    public function __construct() {
        // Initialize DB connection here
        $params = array(
            'username' => 'ari',
            'password' => '[deleted]',
            'host' => 'localhost',
            'database' => 'wmf'
        );
    
        $this->db = new mysqli($params['host'], $params['username'], $params['password'], $params['database']);
        if (!$this->db) {
            die("Could not access database.");
        }
        
        try {
            $this->init();
        } catch (Exception $e) {
            die("Couldn't initialize database: " . $e->getMessage());
        }
    }
                
    /**
     * Ensure that database is initialized
     */
    public function init() {
        if (!$this->checkDb()) {
            $this->populateDbFromFeed(self::SOURCE_URL);
        } else {
            echo "Got exchange rate data. Proceeding...\n";
        }
    }
            
    /**
     * Populate table from data from an XML feed
     * @param string source URL of XML source
     */
    public function populateDbFromFeed($source) {
        // Get feed data from URL
        $xml = file_get_contents($source);
       
        // Use SimpleXML to push feed data into table
		if (!$xml) {
			throw new Exception('No XML string to work with!');
		} else {
			try {
				$this->populate(new SimpleXMLElement($xml));
			} catch(Exception $e) {
				die('Can\'t insert into DB: ' . $e);
			} 
		}
    }
    
    /**
     * Populate the DB from a SimpleXML object.
     * Expects structure like:
     * <conversion>
     *  <currency>BGN</currency>
     *  <rate>0.6707</rate>
     * </conversion>
     * 
     * @param object object Conversion object 
     */
    private function populate($object) {
        if (mysqli_connect_errno()) {
            printf("Connect failed: %s\n", mysqli_connect_error());
            exit();
        }
        
	$stmt = $this->db->prepare('INSERT INTO exchange_rates VALUES(?, "USD", ?)');
	foreach ($object as $conversion) {
		$stmt->bind_param('sd', $conversion->currency, $conversion->rate);
		$stmt->execute();
	}
	$stmt->close();
    }
    
    /**
     * checkDb
     * Check that database has rows 
     */
    public function checkDb() {
	    $query = 'SELECT COUNT(*) as records FROM ' . self::TABLE;
	    $result = $this->db->query($query);
	    $count = $result->fetch_array()[0];
	    return $count;
    }

    /**
     * Retrieves a rate if it exists in the DB, or returns 0 otherwise
     * Does not currently implement "right"
     * @param string $left
     * @param string $right 
     */
    public function getRate($left, $right) {
       if ($left == $right) {
	          throw InvalidArgumentException('Cannot convert a currency to itself');
       }
       $rate = 0.0;

	$stmt = $this->db->stmt_init();
	$stmt->prepare('SELECT rate FROM exchange_rates WHERE currency = ? AND base="USD" LIMIT 1');
	$stmt->bind_param('s', $left);
	$stmt->execute();
	$stmt->bind_result($rate);
	$stmt->fetch();
	return $rate;
    }
}
// End class

// Testing from this point onward
$cc = new CurrencyConverter();

// Convert a few amounts into USD
$tests = array(
    'JPY 5000',
    'CZK 62.5',
    'FOO 6323.5'
);

// Test single conversion
echo "Testing with single value:\n";
$result = $cc->convert($tests[0]);
echo $tests[0] . ": ". $result; 
echo "\n\n";

// Testing multiple conversion
echo "Testing with array of values:\n";
$result = $cc->convert($tests);
$i = 0;
foreach ($result as $r) {
    echo $tests[$i] . ": " . $result[$i] . "\n";
    $i++;
}
