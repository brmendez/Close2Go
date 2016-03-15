//playground


$.ajax({
    url: 'http://localhost:3000/createBooking', //changed from intervalCheck
    data: '{"data": "TEST"}',
    type: 'POST',
    success: function (data) { // post here
        return data;
        //var ret = jQuery.parseXML(data);
        //$('#lblResponse').html(ret.msg);
        //console.log('Success: ')
    }
});