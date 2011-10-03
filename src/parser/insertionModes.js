function initial_mode(t) {
    switch(t) {
    case 0x0009: 
    case 0x000A:
    case 0x000C:
    case 0x000D:
    case 0x0020:
        /* ignore the token */
        return;  
    case COMMENT:
        var data = arguments[1];
        doc.appendChild(doc.createComment(data));
        break;
    case DOCTYPE:
        var name = arguments[1];
        var publicid = arguments[2];
        var systemid = arguments[3];
        doc.appendChild(doc.implementation.createDocumentType(name,
                                                              publicid,
                                                              systemid));
        break;
    case TAG:
        break;
    default:
    }
}