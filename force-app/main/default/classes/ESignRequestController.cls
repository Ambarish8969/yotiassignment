public class ESignRequestController {
    
    @AuraEnabled(cacheable = true)
    public static List<eSign_Request__c> getRequests(Integer pageSize, Integer pageNumber){
        Integer limitSize = (pageSize == null || pageSize < 1) ? 10 : pageSize;
        Integer page = (pageNumber == null || pageNumber < 1) ? 1 : pageNumber;
        Integer offsetRows = (page - 1) * limitSize;
        
        return [SELECT Id, Name, Sent_to__c, Signing_Status__c, Sent_On__c FROM eSign_Request__c 
                WITH USER_MODE 
                ORDER BY Sent_On__c DESC 
                LIMIT :limitSize OFFSET :offsetRows
               ];
    }
    
    @AuraEnabled(cacheable = true)
    public static Integer getCounts(){
        return [SELECT COUNT() FROM eSign_Request__c WITH USER_MODE];
    }

}