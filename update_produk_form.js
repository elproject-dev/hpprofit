const fs = require('fs');

let content = fs.readFileSync('app/produk/components/produk-form.tsx', 'utf8');

const bahanMobileStr = `
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {komposisiBahan.map((item, index) => {
              const selectedBahan = bahanBakuList.find(b => b.id === item.bahanId)
              const div = parseFloat(item.pembagi) || 1
              const hppSubtotal = selectedBahan && item.takaran ? (selectedBahan.harga * parseFloat(item.takaran)) / div : 0

              return (
                <div key={item.id} className="border rounded-md p-3 relative bg-background flex flex-col gap-3 shadow-sm">
                  <div className="flex gap-3 items-start">
                     {selectedBahan?.foto ? (
                       <img src={selectedBahan.foto} alt="" className="w-12 h-12 shrink-0 aspect-square object-cover rounded-md border" />
                     ) : (
                       <div className="w-12 h-12 shrink-0 aspect-square bg-muted flex items-center justify-center rounded-md border"><BoxIcon className="w-5 h-5 opacity-50" /></div>
                     )}
                     
                     <div className="flex-1 min-w-0 pr-8">
                        <Combobox value={item.bahanId} onValueChange={(val) => {
                          if (!val) return
                          const newArr = [...komposisiBahan]
                          newArr[index].bahanId = val as string
                          const selected = bahanBakuList.find(b => b.id === val)
                          if (selected) newArr[index].searchQuery = selected.nama
                          setKomposisiBahan(newArr)
                        }}>
                          <ComboboxInput
                            className="w-full h-8 text-xs"
                            placeholder="Cari bahan..."
                            value={item.searchQuery}
                            onChange={(e) => {
                              const newArr = [...komposisiBahan]
                              newArr[index].searchQuery = e.target.value
                              setKomposisiBahan(newArr)
                            }}
                          />
                          <ComboboxContent>
                            <ComboboxList>
                              {bahanBakuList
                                .filter(b => b.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || b.id === item.bahanId)
                                .map((b) => (
                                  <ComboboxItem key={b.id} value={b.id}>
                                    <div className="flex items-center gap-2">
                                      {b.foto ? (
                                        <img src={b.foto} alt={b.nama} className="w-5 h-5 object-cover rounded border" />
                                      ) : (
                                        <div className="w-5 h-5 bg-muted flex items-center justify-center rounded border"><BoxIcon className="w-3 h-3 opacity-50" /></div>
                                      )}
                                      <span className="text-xs">{b.nama}</span>
                                    </div>
                                  </ComboboxItem>
                                ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedBahan ? \`Rp \${selectedBahan.harga.toLocaleString('id-ID')} / \${selectedBahan.satuan}\` : "-"}
                        </div>
                     </div>

                     <Button 
                       type="button" 
                       variant="ghost" 
                       size="icon" 
                       className="absolute top-2 right-2 text-destructive h-8 w-8"
                       onClick={() => setKomposisiBahan(komposisiBahan.filter((_, i) => i !== index))}
                     >
                       <Trash2Icon className="w-4 h-4" />
                     </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Jumlah Dipakai</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" step="any" min="0" value={item.takaran} onChange={(e) => {
                           const newArr = [...komposisiBahan]; newArr[index].takaran = e.target.value; setKomposisiBahan(newArr);
                        }} className="h-8 text-xs" placeholder="0" />
                        <span className="text-xs w-8 truncate">{selectedBahan?.satuan || "-"}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Bisa Utk (Porsi)</Label>
                      <Input type="number" step="any" min="1" value={item.pembagi} onChange={(e) => {
                           const newArr = [...komposisiBahan]; newArr[index].pembagi = e.target.value; setKomposisiBahan(newArr);
                        }} className="h-8 text-xs" placeholder="1" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2 mt-1">
                    <div className="text-[11px] text-muted-foreground">
                      HPP: <strong className="text-foreground">Rp {Math.round(hppSubtotal).toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground border">
                      {formatTakaranPerPorsi(item.takaran, item.pembagi, selectedBahan?.satuan || "")} / porsi
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
`;

const packMobileStr = `
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {komposisiPackage.map((item, index) => {
              const selectedPack = packagingList.find(p => p.id === item.packagingId)
              const div = parseFloat(item.pembagi) || 1
              const hppSubtotal = selectedPack && item.jumlah ? (selectedPack.harga * parseFloat(item.jumlah)) / div : 0

              return (
                <div key={item.id} className="border rounded-md p-3 relative bg-background flex flex-col gap-3 shadow-sm">
                  <div className="flex gap-3 items-start">
                     {selectedPack?.foto ? (
                       <img src={selectedPack.foto} alt="" className="w-12 h-12 shrink-0 aspect-square object-cover rounded-md border" />
                     ) : (
                       <div className="w-12 h-12 shrink-0 aspect-square bg-muted flex items-center justify-center rounded-md border"><BoxIcon className="w-5 h-5 opacity-50" /></div>
                     )}
                     
                     <div className="flex-1 min-w-0 pr-8">
                        <Combobox value={item.packagingId} onValueChange={(val) => {
                          if (!val) return
                          const newArr = [...komposisiPackage]
                          newArr[index].packagingId = val as string
                          const selected = packagingList.find(p => p.id === val)
                          if (selected) newArr[index].searchQuery = selected.nama
                          setKomposisiPackage(newArr)
                        }}>
                          <ComboboxInput
                            className="w-full h-8 text-xs"
                            placeholder="Cari kemasan..."
                            value={item.searchQuery}
                            onChange={(e) => {
                              const newArr = [...komposisiPackage]
                              newArr[index].searchQuery = e.target.value
                              setKomposisiPackage(newArr)
                            }}
                          />
                          <ComboboxContent>
                            <ComboboxList>
                              {packagingList
                                .filter(p => p.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || p.id === item.packagingId)
                                .map((p) => (
                                  <ComboboxItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                      {p.foto ? (
                                        <img src={p.foto} alt={p.nama} className="w-5 h-5 object-cover rounded border" />
                                      ) : (
                                        <div className="w-5 h-5 bg-muted flex items-center justify-center rounded border"><BoxIcon className="w-3 h-3 opacity-50" /></div>
                                      )}
                                      <span className="text-xs">{p.nama}</span>
                                    </div>
                                  </ComboboxItem>
                                ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedPack ? \`Rp \${selectedPack.harga.toLocaleString('id-ID')} / \${selectedPack.satuan}\` : "-"}
                        </div>
                     </div>

                     <Button 
                       type="button" 
                       variant="ghost" 
                       size="icon" 
                       className="absolute top-2 right-2 text-destructive h-8 w-8"
                       onClick={() => setKomposisiPackage(komposisiPackage.filter((_, i) => i !== index))}
                     >
                       <Trash2Icon className="w-4 h-4" />
                     </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Jumlah Dipakai</Label>
                      <div className="flex items-center gap-2">
                        <Input type="number" step="any" min="0" value={item.jumlah} onChange={(e) => {
                           const newArr = [...komposisiPackage]; newArr[index].jumlah = e.target.value; setKomposisiPackage(newArr);
                        }} className="h-8 text-xs" placeholder="0" />
                        <span className="text-xs w-8 truncate">{selectedPack?.satuan || "-"}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-muted-foreground">Bisa Utk (Porsi)</Label>
                      <Input type="number" step="any" min="1" value={item.pembagi} onChange={(e) => {
                           const newArr = [...komposisiPackage]; newArr[index].pembagi = e.target.value; setKomposisiPackage(newArr);
                        }} className="h-8 text-xs" placeholder="1" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2 mt-1">
                    <div className="text-[11px] text-muted-foreground">
                      HPP: <strong className="text-foreground">Rp {Math.round(hppSubtotal).toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground border">
                      {formatTakaranPerPorsi(item.jumlah, item.pembagi, selectedPack?.satuan || "")} / porsi
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
`;

// Replace Bahan Baku Table wrapper
content = content.replace(
  '<div className="border rounded-none bg-card overflow-x-auto">',
  '          <> ' + bahanMobileStr + '\n          <div className="hidden md:block border rounded-none bg-card overflow-x-auto">'
);

// Replace Packaging Table wrapper
content = content.replace(
  '<div className="border rounded-none bg-card overflow-x-auto">',
  '          <> ' + packMobileStr + '\n          <div className="hidden md:block border rounded-none bg-card overflow-x-auto">'
);

// Close the fragments
// We need to replace the closing tags of the tables. The tables end with:
//               </TableBody>
//             </Table>
//           </div>
content = content.replace(
  '              </TableBody>\n            </Table>\n          </div>',
  '              </TableBody>\n            </Table>\n          </div>\n          </>'
);
content = content.replace(
  '              </TableBody>\n            </Table>\n          </div>',
  '              </TableBody>\n            </Table>\n          </div>\n          </>'
);

fs.writeFileSync('app/produk/components/produk-form.tsx', content);
console.log('Script executed');
