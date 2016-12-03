var $table = $('#tbTransacoes');
var request;
var filer;
var ofx_resultado;
var curDate = new Date();

$(function() {
	$(document).on('click', '#tbTransacoes tr', function() {
	//$('#tbTransacoes').find('tr').click( function(){
		if ($(this).hasClass('selected')) {
			if (!$('#tbTransacoes .editaTransacao').length) {
				if ($(this).attr('data-editavel')==1) {
					adicionaEdicao($(this).attr('id'));
				} else {
					$('#erro').fadeIn(50);
				}
			} else {
				$('#btCancelar').fadeIn(50).fadeOut(20).fadeIn(50);
				$('#btSalvar').fadeIn(50).fadeOut(20).fadeIn(50);
			}
		} else if (!$('#tbTransacoes .editaTransacao').length){
			$('#tbTransacoes').bootstrapTable('check',$(this).index());
		} else {
			$('#btCancelar').fadeIn(50).fadeOut(20).fadeIn(50);
				$('#btSalvar').fadeIn(50).fadeOut(20).fadeIn(50);
		}
	});
	
	
	
	$('#fechaErro').click( function() {
		$('#erro').fadeOut(50);
	});
	
	filer = $('#filer_input').filer({
		showThumbs: false,
		addMore: false,
		allowDuplicates: false,
		limit: 1,
		maxSize: 1,
		extensions: ["ofx"],
		uploadFile: {
			url: '/enviaArquivo/index.php',
			data: null,
            type: 'POST',
            enctype: 'multipart/form-data',
            beforeSend: function(){},
            success: function(data, el){
				ofx_resultado = JSON.parse(data);
				lerPreviaOFX(ofx_resultado,data);
            },
            error: function(el){
                var parent = el.find(".jFiler-jProgressBar").parent();
                el.find(".jFiler-jProgressBar").fadeOut("slow", function(){
                    $("<div class=\"jFiler-item-others text-error\"><i class=\"icon-jfi-minus-circle\"></i> Error</div>").hide().appendTo(parent).fadeIn("slow");    
                });
            },
            statusCode: null,
            onProgress: null,
            onComplete: null
        }
	});
});

function geraListaContas() {
	var lista = '<select name="conta" id="importarNaConta">';
	for (i=0;i<contas.length;i++) {
		lista += '<option value='+contas[i].id+'>'+contas[i].conta_nome+'</option>'
	}
	lista += '</select>';
	return lista;
}

//Esta função lê a prévia do arquivo OFX e formata o modal:
function lerPreviaOFX(arrayOFX,arrayOFX_unparse) {
	$('#OFX_Inicio').fadeOut(20);
	$('#OFX_Resultado').fadeIn(20);
	$('#OFX_Resultado').html('');
	sHTML = `<p><b>Importar de</b>: `+arrayOFX.accountNumber[0]+`<br />
			 <b>Início:</b> `+ arrayOFX.statement.startDate.date +` <b>Término:</b> `+ arrayOFX.statement.endDate.date +`</p>`;
	sHTML += `<br /><strong>Importar em:</strong><br />`;
	sHTML += geraListaContas();
	textoOFX = (JSON.stringify(arrayOFX));
	sHTML += `<textarea rows="4" cols="50" name="OFX" style="display:none">`+arrayOFX_unparse+`</textarea>`
	sHTML += `<input type="text" style="display:none" name="old_url" value="`+window.location.href+`">`;
	sHTML += `<br /><br /><p><strong>Deseja continuar a importação?</strong></p>`;
	$('#OFX_Resultado').append(sHTML);
	if (contaNome!='') {
		$('#importarNaConta').val(contaID);
	}
	$('#btImportarFinal').prop('disabled',false);
}

$(document).on('focus', '.select2', function() {
    $(this).siblings('select').select2('open');
});


$(document).on('click', function(evt) {
	if($(evt.target).is('#btCancelar')) {
        cancelaEdicao();
    } else if($(evt.target).is('#btSalvar')) {
		salvaTransacao();
	} else if($(evt.target).is('#btAddSub')) { 
		adicionaSubtransacao();
	} else if($(evt.target).is('#remSubt')) { 
		linha = evt.target.closest('tr');
		linha.remove();
		nrsubTr = +$('#tbTransacoes').find('#countTr').val()-1;
		$('#tbTransacoes').find('#countTr').val(nrsubTr);
		if (!$('#tbTransacoes').find('#sub'+ nrsubTr).length) {
			$('#tbTransacoes').find('#countTr').val(1);
			$('#split').val('false');
		}
	} else if($(evt.target).is('#btAddTransacao')) { 
		adicionaTransacao()		
	} else if($(evt.target).is('#btExcluirSel')) { 
		deletarTransacoesSelecionadas();
	} else if($(evt.target).is('#btFile')) { 
		importaArquivo();
	} else if($(evt.target).is('#btImport')) {
		$('#OFX_Inicio').fadeIn(20);
		$('#OFX_Resultado').fadeOut(20);
	} else if($(evt.target).is('#btImportarFinal')) {
		importaArquivoFinal(ofx_resultado);
	} 
});

function importaArquivo() {
	filer.prop('jFiler').reset();	
	$('#filer_input').trigger('click');	
	$('#btImportarFinal').prop('disabled',true);
}

function importaArquivoFinal($arrayOFX) {
	
}

document.onkeydown = function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
        isEscape = (evt.keyCode == 27);
    }
    if (isEscape) {
        cancelaEdicao();
    }
};


function deletarTransacoesSelecionadas() {
		
	$('#tbTransacoes .selected').each(function(index) {
		trid = $(this).attr('data-tid');
		$(this).remove();
		$.post(base_url+"deletaTransacao", { trid: trid });
	});
}

function adicionaTransacao() {
	if ($('#tbTransacoes .editaTransacao').length){
		$('#btCancelar').fadeIn(10).fadeOut(100).fadeIn(100);
		$('#btSalvar').fadeIn(50).fadeOut(100).fadeIn(100);
	} else {
		rID='New';
		if (contaID==0) {
			contaID='';
			contaNome='';
		}
		proxNr = +$('#tbTransacoes tr:last').attr('data-index')+1;
		
		htmlSum = `<tr id="r`+rID+`" data-index="`+proxNr+`" data-tid="" data-editavel="1" style="display:none">
					<td class="bs-checkbox"><input data-index="`+proxNr+`" name="btSelectItem" type="checkbox"></td>
					<td id="col_conta_nome"></td>
					<td id="col_data"></td>
					<td id="col_sacado_nome"></td>
					<td id="col_categoria"></td>
					<td id="col_memo"></td>
					<td id="col_saida"></td>
					<td id="col_entrada"></td>
					<td id="col_saldo"></td>	
				</tr>`;
		htmEditavel = `<tr class="editaTransacao selected" id="main1" data-parent="`+rID+`">
					<td><input name="tritem_id" value="" style="display:none"></td>
					<td><div id="conta_nome" class="input-group-btn"><input type="text" placeholder="Conta" id="conta" data-formValue="`+contaID+`" value="`+contaNome+`" class="form-control form-inline transacao input-sm typeahead"/></div></td>
					<td><input name="dataTr" type="text" data-provide="datepicker" placeholder="Data" id="dataTr" value="`+$.format.date(curDate,'dd/MM/yyyy')+`" class="form-control form-inline transacao input-sm"></td>
					<td><input type="text" placeholder="Sacado" data-trid="" id="sacado" name="sacado" value="" class="form-control form-inline transacao input-sm"/></td>
					<td id="cat"></td>
					<td><input type="text" placeholder="Memo"  data-trid="" id="memo" name="memo" value="" class="form-control form-inline transacao input-sm"/></td>
					<td><input type="text" name="totalSaida" placeholder="Saída" id="totalSaida" value="" class="form-control form-inline transacao input-sm"/></td>
					<td><input type="text" name="totalEntrada" placeholder="Entrada" id="totalEntrada" value="" class="form-control form-inline transacao input-sm"/></td>
					<td><input type="text" name="split" id="split" value="false" style="display:none"></td>
				</tr>
				<tr class="editaTransacao selected">
					<td></td><td><input name="contaID" type="text" id="contaID" value="`+contaID+`" style="display:none">
					</td><td><input type="text" name="transacaoID" id="transacaoID" value="" style="display:none"></td>
					<td>
						<button type="button" class="btn btn-info btn-sm" aria-label="Adicionar Subtransação"  id="btAddSub">
						  <span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Subtransação/Transferência
						</button>
					</td>							
					<td style="text-align: right">Faltando distribuir:</td><td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr class="editaTransacao">
					<td></td><td><input name="countTr" id="countTr" value="1"  style="display:none"></td>
					<td></td><td></td><td></td>
					<td></td>
					<td>
						<button type="submit" class="btn btn-success btn-sm" aria-label="Salvar" id="btSalvar">
						  <span class="glyphicon glyphicon-ok-sign" aria-hidden="true"></span> Salvar
						</button>
					</td>
					<td>
						<button type="button" class="btn btn-danger btn-sm" aria-label="Cancelar" id="btCancelar">
						  <span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span> Cancelar
						</button>
					</td>
					<td></td>
				</tr>`;
		$('#tbTransacoes tr:last').after(htmlSum);
		$('#tbTransacoes tr:last').after(htmEditavel);
		if ($('.categorias').data('select2')) {
			$('.categorias').select2('destroy');
		}
		$('#cat').html($('.categorias:first').clone());
		$('#cat').find('select').attr('id','categoria');
		$('#cat').find('select').attr('name','categoria');
		$('.categorias').select2({
			placeholder: 'Categorize a transação'
		});
		$('#categoria_'+proxNr).select2('val','0');
		$('select').on("select2:select", function (e) { 
			alteraMultiplos(e.params.data.id,e.currentTarget);
		});
		
		$('#tbTransacoes').find('#countTr').val(1);
		ligaCompletar();
		if (contaNome=='') {
			$('#tbTransacoes #conta').focus();
		} else {
			$('#tbTransacoes #sacado').focus();
		}
	}
}

function adicionaEdicao(row) {
	var detail = ($('#'+row));
	var id = row;
	var res = $("#edita_"+id).html();
	detail.after(res);	
	ligaCompletar();
	$('#'+row).hide();
}

$table.on('expand-row.bs.table', function(e, index, row, $detail) {
  var id = row._id;
  var res = $("#desc_" + id).html();
  $detail.html(res);
});

$table.on("click-row.bs.table", function(e, row, $tr) {
  if ($tr.next().is('tr.detail-view')) {
    $table.bootstrapTable('collapseRow', $tr.data('index'));
  } else {
    $table.bootstrapTable('expandRow', $tr.data('index'));
  }
});

function adicionaSubtransacao() {
	$('#split').val('true');
	nrsubTr = +$('#tbTransacoes').find('#countTr').val();
	if ($('#tbTransacoes').find('#sub'+ nrsubTr).length) {
		proxNrID = nrsubTr + 1-1;
	} else {
		proxNrID = nrsubTr-1;
		$("#categoria").val('multiplos').trigger('change');
	}
	tritem_ID = '<input name="tritem_id_'+proxNrID+'" val()="" style="display:none">';
	html = `
		<tr class="editaTransacao selected" id="sub`+(proxNrID+1)+`">
			<td><input type="text" name="transferir_para_id_`+proxNrID+`" id="transferir_para_id_`+proxNrID+`" val()="" style="display:none"></td>
			<td>`+tritem_ID+`</td>
			<td align="right"><a href="#"><span style="font-size: 22px; padding-top:4px;" class="glyphicon glyphicon-remove-circle" aria-hidden="true"  id="remSubt" data-id="`+proxNrID+`"></span></a></td>
			<td><div id="conta_nome" class="input-group-btn"><input type="text" placeholder="Transferir para:" data-trid="`+proxNrID+`" id="transferir_`+proxNrID+`" name="transferir_`+proxNrID+`>" data-intTr="`+proxNrID+`" value="" class="form-control form-inline transacao input-sm typeahead transferir_para"/></div></td>
			<td id="cat`+proxNrID+`"></td>
			<td><input type="text" placeholder="Memo"  data-trid="`+proxNrID+`" id="memo_`+proxNrID+`" name="memo_`+proxNrID+`" val()="`+$('#memo').val()+`" class="form-control form-inline transacao input-sm" disabled/></td>
			<td><input type="text" placeholder="Saída" data-trid="`+proxNrID+`"  id="saida_`+proxNrID+`" name="saida_`+proxNrID+`" val()="" class="form-control form-inline transacao input-sm"/></td>
			<td><input type="text" placeholder="Entrada" data-trid="`+proxNrID+`"  id="entrada_`+proxNrID+`" name="entrada_`+proxNrID+`" val()="" class="form-control form-inline transacao input-sm"/></td>
			<td></td>
		</tr>
	`;
	
	if ($('#tbTransacoes').find('#sub'+ nrsubTr).length) {
		$('#tbTransacoes').find('#sub'+ nrsubTr).after(html);
		nrsubTr+=1;
	} else {
		$('#tbTransacoes').find('#main'+ nrsubTr).after(html);
	}
	$('.categorias').select2('destroy');
	$('#cat'+proxNrID).html($('.categorias:first').clone());
	$('#cat'+proxNrID).find('select').attr('id','categoria_'+proxNrID);
	$('#cat'+proxNrID).find('select').attr('name','categoria_'+proxNrID);
	$('.categorias').select2({
		placeholder: 'Categorize a transação'
	});
	$('#categoria_'+proxNrID).select2('val','0');
	$('select').on("select2:select", function (e) { 
		alteraMultiplos(e.params.data.id,e.currentTarget);
	});
	
	$('#tbTransacoes').find('#countTr').val(nrsubTr);
	ligaCompletar();
}

//Esta função verifica se a opção de multiplos foi selecionada, e ativa ou desativa a tela de subtransacoes
function alteraMultiplos(id,categoria) {
	//se a categoria_0 for selecionada com outro valor que multiplos, remove eventuais subitens
	
	if (id!='multiplos' && categoria.id == 'categoria') {
		$('#tbTransacoes').find('[id^=sub]').remove();
		$('#tbTransacoes').find('#countTr').val(1);
		$('#split').val('false');
	} else if ((id=='multiplos') && ($('#tbTransacoes').find('[id^=sub]').length==0)) {
		adicionaSubtransacao();
	}
}

function cancelaEdicao(proxima) {
	if ($('#tbTransacoes .editaTransacao').length) {
		$('select').select2('destroy'); 
		prowID = $('#tbTransacoes .editaTransacao:first').attr('data-parent');
		$('#r'+prowID).show();
		$('#tbTransacoes .editaTransacao').remove();
		
		if (proxima) {
			var proximaLinha = $('#tbTransacoes').find("[data-index='" + (+$('#r'+prowID).attr('data-index')+1) + "']");
			
			if (proximaLinha.attr('data-editavel')==1) {
				adicionaEdicao(proximaLinha.attr('id'));
				$('#categoria').focus();
			}
		}
	}
}

function salvaTransacao() {
	
	// Abort any pending request
    if (request) {
        request.abort();
    }
	// setup some local variables
    var $form = $('#formTransacoes');

    // Let's select and cache all the fields
    var $inputs = $form.find("input, select, button, textarea");
	
    // Serialize the data in the form
    var serializedData = $form.serialize();
	
	
    // Let's disable the inputs for the duration of the Ajax request.
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop("disabled", true);

    // Fire off the request to /form.php
	request = $.ajax({
        url: base_url+"editaTransacao",
        type: "post",
        data: serializedData
    });
	var newID='';
    // Callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
		newID = JSON.stringify(response);
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error(
            "The following error occurred: "+
            textStatus, errorThrown, jqXHR.responseText
        );
		
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // Reenable the inputs
        $inputs.prop("disabled", false);
    });
	//rID='New';
	//Deu certo, vamos atualizar a primeira linha e deletar a edição:
	$inputs.prop("disabled", false);
	var linhaEditada = $('#tbTransacoes').find('[id^=main]');
	var linhaEditar = $('#r' + $('#tbTransacoes').find('[id^=main]').attr('data-parent'));
	linhaEditar.fadeIn(20);		
	linhaEditar.find('#col_conta_nome').html(linhaEditada.find('#conta').val());
	linhaEditar.find('#col_data').html(linhaEditada.find('#dataTr').val());
	linhaEditar.find('#col_sacado_nome').html(linhaEditada.find('#sacado').val());
	var data = linhaEditada.find('#categoria').select2('data');
	linhaEditar.find('#col_categoria').html(data[0].text);
	linhaEditar.find('#col_memo').html(linhaEditada.find('#memo').val());
	total = +linhaEditar.find('#col_entrada').html()-linhaEditar.find('#col_saida').html();
	
	totalNovo = +linhaEditada.find('#totalEntrada').val()-linhaEditada.find('#totalSaida').val();
	
	saldo = +linhaEditar.find('#col_saldo').html()+(totalNovo-total)
	linhaEditar.find('#col_saida').html(linhaEditada.find('#totalSaida').val());
	linhaEditar.find('#col_entrada').html(linhaEditada.find('#totalEntrada').val());
	linhaEditar.find('#col_saldo').html(saldo);
	
	console.log(newID);
	if ($('#tbTransacoes').find('[id^=main]').attr('data-parent') == 'New') {
		linhaEditar.attr('id','r'+linhaEditar.attr('data-index'));
		linhaEditar.attr('data-tid',newID);
	}
	cancelaEdicao(true);
	
	//TODO: rotina para recalcular todo o saldo e o sidemenu
		
}

// constructs the suggestion engine
var lista_contas = new Bloodhound({
  queryTokenizer: Bloodhound.tokenizers.whitespace,                                                                                                                                                      
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('conta_nome'),  
  
  local: contas
});

function lista_contasWithDefault(q, sync) {
	  if (q === '') {
    sync(lista_contas.all()); // This is the only change needed to get 'ALL' items as the defaults
  }

  else {
    lista_contas.search(q, sync);
  }
}

function ligaCompletar() {
	$('#conta_nome .typeahead').typeahead({
	  hint: false,
	  highlight: true,
	  minLength: 0
	},
	{
	  name: 'contas',
	  source: lista_contasWithDefault,
	  display: 'conta_nome',
	  templates: {
		header: '<h3 class="nome_contas">Contas</h3>',
		empty: '<h3 class="nome_contas">Contas</h3><h5 class="conteudo">Conta não encontrada</h5>',
		suggestion: function(data) {
			return '<p>' + data.conta_nome + '</p>';
		}
	  }
	});
	
	
	$('#conta').bind('typeahead:autocomplete', function(ev, suggestion) {
		salvaOpcao(suggestion.id, '#contaID');
	});
	$('#conta').bind('typeahead:select', function(ev, suggestion) {
		salvaOpcao(suggestion.id, '#contaID');
	});
	$('#conta').bind('typeahead:cursorchange', function(ev, suggestion) {
		salvaOpcao(suggestion.id, '#contaID');
	});
	
	$('.transferir_para').bind('typeahead:autocomplete', function(ev, suggestion) {
		salvaOpcao(suggestion.id, '#transferir_para_id_'+$('#'+ev.target.id).attr('data-intTr'));
	});
	$('.transferir_para').bind('typeahead:select', function(ev, suggestion) {
		salvaOpcao(suggestion.id, '#transferir_para_id_'+$('#'+ev.target.id).attr('data-intTr'));
	});
	$('.transferir_para').bind('typeahead:cursorchange', function(ev, suggestion) {
		salvaOpcao(suggestion.id, '#transferir_para_id_'+$('#'+ev.target.id).attr('data-intTr'));
	});
	
	$('#tbTransacoes').find('[id^=transferir_]').blur(function() {
		if ($(this).val()=='') {
			salvaOpcao('', '#transferir_para_id_'+$(this).attr('data-intTr'));
		}
	});
	
	$('select').select2({
		placeholder: 'Categorize a transação'
	});
	$('select').on("select2:select", function (e) { 
		alteraMultiplos(e.params.data.id,e.currentTarget);		
	});
	
	$('select').on("select2:close", function (e) { 
		$('#memo').focus();
	});
	
	
	$('#dataTr').datepicker({
		format: "dd/mm/yyyy",
		todayBtn: "linked",
		autoclose: true,
		toggleActive: true,
		daysOfWeekHighlighted: "0,6",
		language: "pt-BR",
		todayHighlight: true
	}).on('changeDate', function (date, options) {
		//$('#sacado').focus();
		//var parts = date.split('/');
	//please put attention to the month (parts[0]), Javascript counts months from 0:
	// January - 0, February - 1, etc
		//curDate= new Date(parts[2],parts[0]-1,parts[1]); 
		curDate = date.date;
		$(this).select();
	});
}

function salvaOpcao (valor, campo) {
	$('#tbTransacoes').find(campo).val(valor);
}

function monthSorter(a, b) {
    if (a.month < b.month) return -1;
    if (a.month > b.month) return 1;
    return 0;
}