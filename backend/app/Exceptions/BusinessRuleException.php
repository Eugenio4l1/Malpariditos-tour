<?php

namespace App\Exceptions;

use Exception;

class BusinessRuleException extends Exception
{
    protected string $errorCode;

    public function __construct(string $message, string $errorCode = 'BUSINESS_RULE_VIOLATION')
    {
        parent::__construct($message);
        $this->errorCode = $errorCode;
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}